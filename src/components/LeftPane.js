import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API requests
import { useDrag, useDrop } from 'react-dnd';
import { LuLayoutPanelLeft, LuPanelRightOpen, LuPanelRightClose } from 'react-icons/lu';
import { MdOutlineAddchart, MdOutlineDeleteOutline } from 'react-icons/md';
import { TbCapture } from 'react-icons/tb'; // Import TbCapture
import { HiOutlineDocument } from 'react-icons/hi'; // Import HiOutlineDocument
import { IoAdd } from 'react-icons/io5';

function DraggableMenuItem({ item, index, moveItem, onItemSelect, onIconClick, hoveredItem, setHoveredItem, isDynamic, onDelete, selectedItem }) {
  const [, dragRef] = useDrag({
    type: 'item',
    item: { index, id: item.id },
  });

  const [, dropRef] = useDrop({
    accept: 'item',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const combinedRef = (node) => {
    if (node) {
      dragRef(node);
      dropRef(node);
    }
  };

  const itemId = item.id || `item-${index}`;
  const icon = item.title === 'Capture Quick Ideas' ? <TbCapture /> : <HiOutlineDocument />;

  return (
    <li
      ref={combinedRef}
      onMouseEnter={() => setHoveredItem(itemId)}
      onMouseLeave={() => setHoveredItem(null)}
      onClick={() => onItemSelect(item)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: selectedItem?.id === item.id ? '#3e3e3e' : 'transparent',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon} {item.title || 'Untitled'}
      </span>

      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {hoveredItem === itemId && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onIconClick(item);
            }}
            style={{ cursor: 'pointer' }}
          >
            <LuLayoutPanelLeft />
          </span>
        )}

        {isDynamic && hoveredItem === itemId && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id); // Call the delete function here
            }}
            style={{ cursor: 'pointer' }}
          >
            <MdOutlineDeleteOutline />
          </span>
        )}
      </span>
    </li>
  );
}

function LeftPane({ predefinedItems, onItemSelect, onIconClick, isCollapsed, moveItem, createNewPage, deletePage, selectedItem }) {
  const [dynamicPages, setDynamicPages] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch dynamic pages from the server on component mount
  useEffect(() => {
    const fetchDynamicPages = async () => {
      const userId = localStorage.getItem('user_id'); // Get user ID from localStorage

      if (userId) {
        try {
          const response = await axios.get(`http://localhost:8888/project2025/left_pane_dynamic_menu_fetch.php?user_id=${userId}`);
          if (response.data.success) {
            setDynamicPages(response.data.pages);
          } else {
            console.error('Failed to fetch dynamic pages');
          }
        } catch (error) {
          console.error('Error fetching dynamic pages:', error);
        }
      } else {
        console.error('No user ID found');
      }
    };

    fetchDynamicPages();
  }, []);

  const handleCreateNewPage = async () => {
    const userId = localStorage.getItem('user_id'); // Get user ID from localStorage

    if (userId) {
      try {
        // Create a new page with default title and content
        const response = await axios.post('http://localhost:8888/project2025/save_dynamic_page.php', {
          user_id: userId,
          title: 'Untitled Page',
          content: JSON.stringify({ blocks: [], entityMap: {} }), // Empty content for new pages
        });

        // Log the response to debug the issue
        console.log("API Response:", response.data);

        if (response.data.success) {
          // Add the new page to the dynamic pages list
          setDynamicPages([...dynamicPages, { id: response.data.page_id, title: 'Untitled Page', content: '' }]);
          // Automatically select the newly created page
          onItemSelect({ id: response.data.page_id, title: 'Untitled Page', content: '' });
        } else {
          console.error('Failed to create a new page:', response.data.message);
          alert('Failed to create a new page: ' + response.data.message); // Add an alert to notify the user
        }
      } catch (error) {
        // Log the error to help debug the issue
        console.error('Error creating new page:', error);
        alert('Error creating new page: ' + error.message); // Add an alert to notify the user
      }
    } else {
      console.error('No user ID found');
      alert('No user ID found. Please log in.');
    }
  };

  // Function to handle page deletion
  const handleDeletePage = async (pageId) => {
    try {
      const response = await axios.post('http://localhost:8888/project2025/delete_dynamic_page.php', { id: pageId });
      if (response.data.success) {
        // Remove the deleted page from the dynamicPages array
        setDynamicPages(dynamicPages.filter(page => page.id !== pageId));
        // If the currently selected item is the deleted page, deselect it
        if (selectedItem?.id === pageId) {
          onItemSelect(null);
        }
      } else {
        console.error('Failed to delete the page:', response.data.message);
        alert('Failed to delete the page: ' + response.data.message); // Notify the user of failure
      }
    } catch (error) {
      console.error('Error deleting the page:', error);
      alert('Error deleting the page: ' + error.message); // Notify the user of error
    }
  };

  return (
    <div className={`left-pane ${isCollapsed ? 'collapsed' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px' }}>
        <button className="collapse-button" onClick={() => onItemSelect(null)}>
          {isCollapsed ? (
            <span style={{ color: '#e0e0e0' }}>
              <LuPanelRightClose />
            </span>
          ) : (
            <span style={{ color: '#e0e0e0' }}>
              <LuPanelRightOpen />
            </span>
          )}
        </button>

        <IoAdd
          style={{ color: '#e0e0e0', cursor: 'pointer' }}
          onClick={handleCreateNewPage} // Handle new page creation
        />
      </div>

      {!isCollapsed && (
        <div>
          <h4 style={{ marginLeft: '15px' }}>Predefined Pages</h4>
          <ul>
            {predefinedItems.map((item, index) => (
              <DraggableMenuItem
                key={item?.id || `predefined-${index}`}
                item={item}
                index={index}
                moveItem={moveItem}
                onItemSelect={onItemSelect}
                onIconClick={onIconClick}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
                isDynamic={false}
                onDelete={() => {}} // No delete action for predefined items
                selectedItem={selectedItem}
              />
            ))}
          </ul>

          <h4 style={{ marginLeft: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Documents
            <MdOutlineAddchart
              style={{ cursor: 'pointer', marginRight: '10px' }}
              onClick={handleCreateNewPage} // Handle new page creation
            />
          </h4>
          <ul>
            {dynamicPages.map((page, index) => (
              <DraggableMenuItem
                key={page?.id || `dynamic-${index}`}
                item={page}
                index={index + predefinedItems.length}
                moveItem={moveItem}
                onItemSelect={onItemSelect}
                onIconClick={onIconClick}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
                isDynamic={true}
                onDelete={handleDeletePage} // Pass the delete function
                selectedItem={selectedItem}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LeftPane;