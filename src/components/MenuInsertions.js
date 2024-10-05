import { EditorState, Modifier, RichUtils } from 'draft-js';

// Function to insert a block type and move to the next line
export const insertBlock = (editorState, blockType) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  // Insert a new block and move to the next line
  const newContentState = Modifier.splitBlock(contentState, selectionState); // Split the block to start a new line
  const updatedContentState = Modifier.setBlockType(newContentState, newContentState.getSelectionAfter(), blockType);

  // Move the selection to the new block
  const newEditorState = EditorState.push(editorState, updatedContentState, 'split-block');
  const newSelection = newEditorState.getSelection().merge({
    anchorOffset: 0,
    focusOffset: 0,
  });

  return EditorState.acceptSelection(newEditorState, newSelection); // Return editor state with new block selected
};
