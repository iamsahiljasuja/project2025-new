import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import LeftPane from './components/LeftPane';
import CenterPane from './components/CenterPane';
import RightPane from './components/RightPane';
import IdeaCapture from './components/IdeaCapture';
import DynamicPageEditor from './components/DynamicPageEditor';
import HashtagMessages from './components/HashtagMessages'; // Import HashtagMessages component
import Login from './components/Login';
import './App.css';

// Import Drag-and-Drop context
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Component map to dynamically load components
const componentMap = {
  'Capture Quick Ideas': IdeaCapture,
};

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isRightPaneVisible, setIsRightPaneVisible] = useState(false);
  const [rightPaneContent, setRightPaneContent] = useState(null);

  // Add a login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Predefined navigation items
  const [navigationItems] = useState([
    { id: '1', title: 'Capture Quick Ideas', content: 'Capture Quick Ideas' },
    { id: 'hashtag-messages', title: 'Hashtag Messages', content: 'Hashtag Messages' }, // Add Hashtag Messages
  ]);

  // Dynamic pages for the app
  const [dynamicPages, setDynamicPages] = useState([
    { id: '2', title: 'Untitled Page 1', content: 'Initial content 1' },
    { id: '3', title: 'Untitled Page 2', content: 'Initial content 2' },
  ]);

  // Function to create new dynamic pages
  const createNewPage = () => {
    const newPage = {
      id: Date.now().toString(),
      title: 'Untitled Page',
      content: 'Start editing this content...',
    };
    setDynamicPages([...dynamicPages, newPage]);
    setSelectedItem(newPage);
  };

  // Handle the selection of an item for the center pane
  const handleItemSelect = (item) => {
    if (item === null) {
      setIsCollapsed(!isCollapsed);
    } else if (item.id === 'hashtag-messages') {
      setSelectedItem({ type: 'hashtag' }); // Set special type for Hashtag Messages
      setIsRightPaneVisible(false);
      setRightPaneContent(null);
    } else {
      setSelectedItem(item);
      setIsRightPaneVisible(false); // Close the right pane when item is selected in center pane
      setRightPaneContent(null);
    }
  };

  // Handle the icon click to open the right pane with the selected content
  const handleIconClick = (item) => {
    setIsRightPaneVisible(true);
    setRightPaneContent(item);
  };

  // Function to handle login success
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <DndProvider backend={HTML5Backend}>
        <div className="app-container" style={{ height: '100vh' }}>
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            
            {/* Redirect to login if not logged in */}
            {!isLoggedIn ? (
              <Route path="*" element={<Navigate to="/login" />} />
            ) : (
              <>
                {/* Main app layout */}
                <Route
                  path="/"
                  element={
                    <SplitPane
                      split="vertical"
                      minSize={isCollapsed ? 50 : 150}
                      defaultSize={isCollapsed ? 50 : 200}
                      style={{ height: '100vh' }}
                    >
                      <div className={`left-pane ${isCollapsed ? 'collapsed' : ''}`} style={{ height: '100%' }}>
                        <LeftPane
                          predefinedItems={navigationItems}
                          dynamicPages={dynamicPages}
                          onItemSelect={handleItemSelect}
                          onIconClick={handleIconClick} // Handle the icon click for the right pane
                          isCollapsed={isCollapsed}
                          moveItem={() => {}} // Placeholder for moveItem function (not implemented)
                          createNewPage={createNewPage} // Create a new page in the dynamic pages
                        />
                      </div>

                      <SplitPane
                        split="vertical"
                        minSize={200}
                        defaultSize={isRightPaneVisible ? '70%' : '100%'}
                        className="split-pane"
                      >
                        <div>
                          {selectedItem ? (
                            selectedItem.type === 'hashtag' ? (
                              // Render the HashtagMessages component for hashtag page
                              <HashtagMessages />
                            ) : componentMap[selectedItem.content] ? (
                              <CenterPane
                                selectedItem={selectedItem}
                                componentMap={componentMap}
                                onClose={() => setSelectedItem(null)} // Handle close action
                              />
                            ) : (
                              <DynamicPageEditor
                                selectedPage={selectedItem}
                                onTitleChange={(newTitle) =>
                                  setDynamicPages(
                                    dynamicPages.map((page) =>
                                      page.id === selectedItem.id
                                        ? { ...page, title: newTitle }
                                        : page
                                    )
                                  )
                                }
                                onContentChange={(newContent) =>
                                  setDynamicPages(
                                    dynamicPages.map((page) =>
                                      page.id === selectedItem.id
                                        ? { ...page, content: newContent }
                                        : page
                                    )
                                  )
                                }
                              />
                            )
                          ) : (
                            // Render the default message in the center pane
                            <h3>Please select an item from the navigation pane.</h3>
                          )}
                        </div>

                        {isRightPaneVisible ? (
                          <div>
                            <RightPane
                              selectedItem={rightPaneContent} // Render content in the right pane
                              componentMap={componentMap}
                              onClose={() => setIsRightPaneVisible(false)} // Close the right pane
                            />
                          </div>
                        ) : (
                          <div style={{ display: 'none' }}></div>
                        )}
                      </SplitPane>
                    </SplitPane>
                  }
                />
              </>
            )}
          </Routes>
        </div>
      </DndProvider>
    </Router>
  );
}

export default App;
