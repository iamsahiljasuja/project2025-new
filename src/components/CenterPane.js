import React from 'react';

function CenterPane({ selectedItem, componentMap, onClose }) {
  const renderContent = () => {
    if (!selectedItem) {
      return <h3>Please select an item from the navigation pane.</h3>;
    }

    // Check if the selected item is a predefined item (exists in componentMap)
    const SelectedComponent = componentMap[selectedItem.content];

    if (SelectedComponent) {
      // Render the predefined component
      return <SelectedComponent />;
    } else {
      // Render the dynamic page content
      return (
        <div>
          <p>{selectedItem.content}</p> {/* Render dynamic page content */}
        </div>
      );
    }
  };

  return (
    <div className="center-pane full-height">
      {/* Title bar with title and close button */}
      <div className="pane-title-bar">
        <h2>{selectedItem ? selectedItem.title : 'Center Pane'}</h2>
        {selectedItem && <button className="close-button" onClick={onClose}>×</button>}
      </div>
      <div className="pane-content full-height">
        {/* Render content dynamically */}
        {renderContent()}
      </div>
    </div>
  );
}

export default CenterPane;