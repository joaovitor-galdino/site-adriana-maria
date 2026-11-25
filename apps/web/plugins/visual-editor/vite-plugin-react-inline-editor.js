import nodePath from 'path';
import { parse } from '@babel/parser';
import traverseBabel from '@babel/traverse';
import * as t from '@babel/types';
import { generateSourceWithMap, VITE_PROJECT_ROOT } from '../utils/ast-utils.js';
import {
	EDITABLE_HTML_TAGS,
	INLINE_EDIT_HTML_TAGS,
	checkTagNameEditable,
	validateImageSrc,
	hasMeaningfulTextContent,
	shouldDisableDueToChildren,
	evalChildComposition,
	subtreeRequiresAssistance,
	hasEditableAncestor,
	isFragmentElement,
} from './transform/editability.js';
import {
	detectUrlAttribute,
	attachEditAttributes,
	attachAssistedEditId,
} from './transform/inject-attributes.js';

export default function inlineEditPlugin() {
	return {
		name: 'vite-inline-edit-plugin',
		enforce: 'pre',

		transform(code, id) {
			if (!/\.(jsx|tsx)$/.test(id) || !id.startsWith(VITE_PROJECT_ROOT) || id.includes('node_modules')) {
				return null;
			}

			const relativeFilePath = nodePath.relative(VITE_PROJECT_ROOT, id);
			const webRelativeFilePath = relativeFilePath.split(nodePath.sep).join('/');

			try {
				const babelAst = parse(code, {
					sourceType: 'module',
					plugins: ['jsx', 'typescript'],
					errorRecovery: true
				});

				let attributesAdded = 0;

				traverseBabel.default(babelAst, {
					JSXOpeningElement(path) {
						const openingNode = path.node;
						const elementNode = path.parentPath.node;

						if (!openingNode.loc) return;

						const originalLength = openingNode.attributes.length;
						openingNode.attributes = openingNode.attributes.filter(attribute =>
							!(t.isJSXAttribute(attribute) && attribute.name?.name?.startsWith('data-edit-'))
						);
						if (openingNode.attributes.length < originalLength) {
							attributesAdded++;
						}

						if (isFragmentElement(openingNode)) return;

						const line = openingNode.loc.start.line;
						const column = openingNode.loc.start.column + 1;
						const editId = `${webRelativeFilePath}:${line}:${column}`;

						// Condition 1: an annotated ancestor already owns this subtree. Applies to
						// assisted ids too, so a branch never ends up with nested edit targets.
						if (hasEditableAncestor(path)) return;

						// Condition 2: tags outside the editable list cannot be edited in place,
						// but still qualify for an assisted id when they hold text of their own.
						if (!checkTagNameEditable(openingNode, EDITABLE_HTML_TAGS)) {
							if (checkTagNameEditable(openingNode, INLINE_EDIT_HTML_TAGS)) return;

							if (t.isJSXElement(elementNode) && hasMeaningfulTextContent(elementNode)) {
								attachAssistedEditId(openingNode, editId);
								attributesAdded++;
							}
							return;
						}

						// Condition 3: image src must be a non-empty static string
						const imageValidation = validateImageSrc(openingNode);
						if (!imageValidation.isValid) {
							attachAssistedEditId(openingNode, editId);
							attributesAdded++;
							return;
						}

						// Condition 4: mark as assisted-edit if spread props or dynamic children
						if (shouldDisableDueToChildren(elementNode, openingNode)) {
							attachAssistedEditId(openingNode, editId);
							attributesAdded++;
							return;
						}

						// Condition 5: skip or mark assisted-edit based on child composition
						const childResult = evalChildComposition(elementNode, openingNode);
						if (childResult === 'skip') return;
						if (childResult === 'disabled') {
							attachAssistedEditId(openingNode, editId);
							attributesAdded++;
							return;
						}

						// Condition 6: recursive subtree check — dynamic expressions,
						// spread props, or conditionals anywhere below this element make
						// a direct edit unsafe (it would overwrite the JSX with static text).
						if (subtreeRequiresAssistance(elementNode)) {
							attachAssistedEditId(openingNode, editId);
							attributesAdded++;
							return;
						}

						const urlAttributeName = detectUrlAttribute(openingNode);
						attachEditAttributes(openingNode, editId, urlAttributeName);
						attributesAdded++;
					}
				});

				if (attributesAdded > 0) {
					// Vite resolves a map's sources against the module's own directory, so a
					// project-relative name would come out doubled in stack traces.
					const output = generateSourceWithMap(babelAst, id, code);
					return { code: output.code, map: output.map };
				}

				return null;
			} catch (error) {
				console.error(`[vite][visual-editor] Error transforming ${id}:`, error);
				return null;
			}
		}
	};
}
