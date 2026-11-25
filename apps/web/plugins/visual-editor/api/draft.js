import { ParentMessage } from "../constants/messages.js";
import { postToParent } from "../utils/parent-frame.js";
import { getEditing } from "../state/editing-state.js";
import { getCurrentEdits, clearHistory, getEditState, getActionPointer } from "../state/history-state.js";
import { applySessionUndo } from "../utils/session-history-command.js";
import { commitCurrentEdit } from "../ui/inline-edit/edit-action.js";
import { getComments, setComments } from "../state/annotation-state.js";
import { getEditId } from "../constants/selectors.js";
import { clearAllAnnotationMarkers } from "../ui/annotation-panel/annotation-markers.js";
import { hideAnnotationPanel } from "../ui/annotation-panel/panel.js";
import { resetMultiSelectState } from "../state/multi-select-state.js";
import { unlockHoverOutline } from "../ui/overlays/hover-outline.js";

/** Minimum duration (ms) the parent loading indicator stays visible during a direct-only draft save. */
const MIN_LOADING_DISPLAY_MS = 500;

/**
 * Rolls back every committed edit in the history stack and clears it, returning
 * the document to its pre-edit state.
 */
export function discardAllEdits() {
	while (getActionPointer() >= 0) {
		applySessionUndo();
	}
	clearHistory();
}

/**
 * Commits any active inline edit, rolls back all edits in the history stack,
 * clears annotations, and notifies the parent frame that the draft was discarded.
 */
export function handleDraftDiscard() {
	if (getEditing()?.targetElement?.hasAttribute("contenteditable")) {
		commitCurrentEdit();
	}
	discardAllEdits();
	hideAnnotationPanel();
	clearAllAnnotationMarkers();
	setComments([]);
	resetMultiSelectState();
	unlockHoverOutline();
	postToParent(ParentMessage.DRAFT_DISCARDED);
}

/**
 * Hands the current draft edits to the editor, which saves them through the backend.
 *
 * Commits any active contenteditable edit first. The backend writes the direct
 * edits into the source; assisted edits and annotations are applied by the AI
 * during the stream that follows.
 *
 * Parent frame messages emitted:
 * - `DRAFT_SAVE_STARTED` — immediately on call
 * - `DRAFT_APPLIED` — on success, includes the edits and current edit state
 * - `DRAFT_SAVE_FAILED` — when the edits could not be collected, includes error message
 * - `DRAFT_SAVE_FINISHED` — always, delayed by `MIN_LOADING_DISPLAY_MS` for direct-only saves
 *
 * @returns {Promise<void>}
 */
export async function handleDraftSave() {
	if (getEditing()?.targetElement?.hasAttribute("contenteditable")) {
		commitCurrentEdit();
	}
	postToParent(ParentMessage.DRAFT_SAVE_STARTED);
	const startTime = Date.now();
	let hasAssistedEdits = false;
	try {
		const allEdits = getCurrentEdits();

		const visualEdits = [
			...Object.values(allEdits).map(edit => ({
				editId: edit.editId,
				selectionModes: [edit.selectionMode],
				instruction: edit.instruction,
				isAssisted: edit.isAssisted,
			})),
			...getComments().map(({ text, elements, selections, attachments }) => ({
				editId: elements.length === 1 ? getEditId(elements[0]) || undefined : undefined,
				selectionModes: selections,
				instruction: {
					changes: [],
					annotation: text,
					...(attachments?.length && {
						attachments: attachments.map(({ url }) => ({ type: 'image', image: url })),
					}),
				},
				isAssisted: true,
			})),
		];

		hasAssistedEdits = visualEdits.some(edit => edit.isAssisted);

		clearHistory();
		hideAnnotationPanel();
		clearAllAnnotationMarkers();
		setComments([]);
		resetMultiSelectState();
		unlockHoverOutline();
		postToParent(ParentMessage.DRAFT_APPLIED, {
			visualEdits,
			...getEditState(),
		});
	} catch (error) {
		postToParent(ParentMessage.DRAFT_SAVE_FAILED, { error: error.message });
		console.error(`[vite][visual-editor] Error during draft save:`, error);
	} finally {
		if (!hasAssistedEdits) {
			const elapsed = Date.now() - startTime;
			const remaining = MIN_LOADING_DISPLAY_MS - elapsed;
			if (remaining > 0) {
				await new Promise((resolve) => setTimeout(resolve, remaining));
			}
		}
		postToParent(ParentMessage.DRAFT_SAVE_FINISHED);
	}
}
