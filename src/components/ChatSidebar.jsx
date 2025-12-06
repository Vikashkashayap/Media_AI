import { SearchIcon, SettingsIcon } from "./Icons";
import WorkspaceSwitcher from "./workspaces/WorkspaceSwitcher";
import Logo from "./landing/Logo";

export default function ChatSidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  handleNewChat,
  projects,
  selectedProject,
  expandedProjects,
  setExpandedProjects,
  projectConversations,
  currentConversation,
  conversationsWithoutProject,
  isProjectsExpanded,
  setIsProjectsExpanded,
  isChatsExpanded,
  setIsChatsExpanded,
  editingProject,
  setEditingProject,
  editProjectName,
  setEditProjectName,
  showDeleteConfirm,
  setShowDeleteConfirm,
  setShowNewProjectModal,
  handleSelectProject,
  handleSelectConversation,
  toggleProjectExpansion,
  handleEditProject,
  handleSaveProjectEdit,
  handleCancelProjectEdit,
  activeSidebarItem,
  setActiveSidebarItem,
  showSettingsDropdown,
  setShowSettingsDropdown,
  handleLogout,
  settingsRef,
  userProfile,
  autoSubmitBlogs,
  setAutoSubmitBlogs,
  showConnectWebsiteModal,
  setShowConnectWebsiteModal,
  setShowSharesModal
}) {
  // Get user initials from profile
  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Left Sidebar */}
      <aside className={`
        ${isSidebarCollapsed ? 'w-16' : 'w-64'} 
        bg-gray-900/90 backdrop-blur-xl flex flex-col border-r border-gray-700/50 shadow-2xl transition-all duration-300 flex-shrink-0
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Section with Logo and Collapse */}
        <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} mb-4`}>
            {/* Logo - Using landing page logo */}
            <div className={`flex items-center justify-center flex-shrink-0 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-auto h-10'}`}>
              <Logo 
                linkTo="/" 
                size="default"
                className={isSidebarCollapsed ? 'h-10 w-10 object-contain rounded-full' : 'h-10 w-auto object-contain'}
              />
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-all text-gray-300"
                  title="Close sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Collapse Icon - Hidden on mobile */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-700/50 transition-all text-gray-300"
                  title="Collapse sidebar"
                >
                  <svg 
                    className="w-5 h-5 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                </button>
              </div>
            )}
            
            {isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-all text-gray-300"
                  title="Close sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Collapse Icon - Hidden on mobile */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-700/50 transition-all text-gray-300"
                  title="Expand sidebar"
                >
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 rotate-180" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* New Chat and Search Chats Buttons */}
          {isSidebarCollapsed ? (
            <div className="space-y-2">
              <button 
                onClick={() => {
                  handleNewChat(true);
                }}
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-all text-gray-300"
                title="New chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button 
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-all text-gray-300"
                title="Search chats"
              >
                <SearchIcon />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button 
                onClick={() => {
                  handleNewChat(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-all text-gray-300 text-sm font-medium"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New chat</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-all text-gray-300 text-sm font-medium">
                <SearchIcon />
                <span>Search chats</span>
              </button>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          {!isSidebarCollapsed && (
            <div className="px-4 py-2">
              {/* Projects Header */}
              <button
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                className="w-full flex items-center justify-between text-gray-400 text-sm font-medium mb-2 hover:text-cyan-400 transition-colors"
              >
                <span>Projects</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isProjectsExpanded ? '' : '-rotate-90'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Projects List */}
              {isProjectsExpanded && (
                <div className="space-y-1">
                  {/* New Project Button */}
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-500/20 transition-all text-gray-300 text-sm"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New project</span>
                  </button>

                  {/* Existing Projects with Nested Chats */}
                  {projects.map((project) => {
                    const isExpanded = expandedProjects[project.id];
                    const projectConvs = projectConversations[project.id] || [];
                    const isSelected = selectedProject?.id === project.id;
                    const isEditing = editingProject === project.id;

                    return (
                      <div key={project.id} className="space-y-1">
                        {/* Project Header */}
                        <div className={`flex items-center group ${isSelected ? 'bg-cyan-500/20' : ''} rounded-lg`}>
                          <button
                            onClick={() => toggleProjectExpansion(project.id)}
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm text-left min-w-0 ${
                              isSelected ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'
                            }`}
                          >
                            <svg 
                              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? '' : '-rotate-90'}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editProjectName}
                                onChange={(e) => setEditProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveProjectEdit();
                                  } else if (e.key === 'Escape') {
                                    handleCancelProjectEdit();
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-cyan-500/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white min-w-0"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className={`truncate flex-1 ${isSelected ? 'text-cyan-400 font-medium' : 'text-gray-300'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectProject(project);
                                }}
                              >
                                {project.name}
                              </span>
                            )}
                          </button>
                          
                          {/* Edit and Delete Buttons */}
                          {!isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProject(project);
                                }}
                                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-all text-gray-400"
                                title="Edit project"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(project.id);
                                }}
                                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all text-gray-400"
                                title="Delete project"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                          
                          {/* Save/Cancel buttons when editing */}
                          {isEditing && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveProjectEdit();
                                }}
                                className="p-1.5 hover:bg-green-500/20 hover:text-green-400 rounded transition-all text-gray-400"
                                title="Save"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelProjectEdit();
                                }}
                                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all text-gray-400"
                                title="Cancel"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Nested Chats for this Project */}
                        {isExpanded && (
                          <div className="ml-7 space-y-1">
                            {/* New Chat Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Ensure project is selected first (if not already selected)
                                if (selectedProject?.id !== project.id) {
                                  setSelectedProject(project);
                                }
                                // Then clear conversation and start new chat
                                handleNewChat();
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm text-left text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 group"
                            >
                              <svg className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="font-medium">New chat</span>
                            </button>
                            
                            {/* Existing Chats */}
                            {projectConvs.map((conv) => (
                              <button
                                key={conv.id}
                                onClick={() => {
                                  handleSelectProject(project, true);
                                  handleSelectConversation(conv, project);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm text-left ${
                                  currentConversation?.id === conv.id && isSelected
                                    ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                                    : 'text-gray-300 hover:bg-gray-700/50'
                                }`}
                              >
                                <span className="truncate flex-1">{conv.title}</span>
                                {conv.createdAt && (
                                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                    {new Date(conv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </button>
                            ))}
                            {projectConvs.length === 0 && (
                              <p className="text-xs text-gray-500 px-3 py-2">No chats yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Conversations Without Project Section */}
          {!isSidebarCollapsed && (
            <div className="px-4 py-2 border-t border-gray-700/50">
              {/* Conversations Header */}
              <button
                onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                className="w-full flex items-center justify-between text-gray-400 text-sm font-medium mb-2 hover:text-cyan-400 transition-colors"
              >
                <span>Chats</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isChatsExpanded ? '' : '-rotate-90'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Conversations List (without project) */}
              {isChatsExpanded && (
                <div className="space-y-1">
                  {/* New Chat Button (without project) */}
                  <button
                    onClick={() => {
                      handleSelectProject(null);
                      handleNewChat();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm text-left ${
                      !selectedProject
                        ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                        : 'text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400'
                    }`}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">New chat</span>
                  </button>
                  
                  {/* Existing Conversations (without project) */}
                  {conversationsWithoutProject.map((conv) => {
                    const isSelected = currentConversation?.id === conv.id && !selectedProject;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => {
                          handleSelectProject(null, true);
                          handleSelectConversation(conv, null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm text-left ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="truncate flex-1">{conv.title}</span>
                        {conv.createdAt && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {new Date(conv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {conversationsWithoutProject.length === 0 && (
                    <p className="text-xs text-gray-500 px-3 py-2">No chats yet</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings at bottom */}
        <div className="relative p-2 border-t border-gray-700/50 flex-shrink-0" ref={settingsRef}>
          <button
            onClick={() => {
              setActiveSidebarItem("settings");
              setShowSettingsDropdown(!showSettingsDropdown);
            }}
            className={`${isSidebarCollapsed ? 'w-10 h-10 mx-auto' : 'w-full px-3 py-2.5'} flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg transition-all ${
              activeSidebarItem === "settings" ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400"
            }`}
            title="Settings"
          >
            <SettingsIcon />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
          
          {/* Settings Dropdown */}
          {showSettingsDropdown && (
            <div className={`absolute ${isSidebarCollapsed ? 'left-full ml-2 bottom-0' : 'bottom-full left-0 mb-2'} bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 min-w-[200px] z-50`}>
              {/* Active Workspace */}
              <div className="px-2 mb-1">
                <WorkspaceSwitcher />
              </div>
              
              {/* Shares - Added to Settings */}
              {setShowSharesModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSharesModal(true);
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 hover:bg-cyan-500/20 hover:text-cyan-400 flex items-center gap-3 text-left transition-colors text-gray-300 rounded-lg"
                  title="Share your chats and projects"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Shares</span>
                </button>
              )}
              
              {/* Profile/Settings - Added to Settings */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/profile';
                  }
                  setShowSettingsDropdown(false);
                }}
                className="w-full px-4 py-2.5 hover:bg-cyan-500/20 hover:text-cyan-400 flex items-center gap-3 text-left transition-colors text-gray-300 rounded-lg"
                title="Profile settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Profile</span>
              </button>
              
              {/* Divider */}
              <div className="border-t border-gray-700 my-1"></div>
              
              {/* Connect Website */}
              <button
                type="button"
                onClick={() => {
                  setShowConnectWebsiteModal(true);
                  setShowSettingsDropdown(false);
                }}
                className="w-full px-4 py-2.5 hover:bg-cyan-500/20 hover:text-cyan-400 flex items-center gap-3 text-left transition-colors text-gray-300 rounded-lg"
                title="Connect a website to your workspace"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm font-medium">Connect Website</span>
              </button>
              
              {/* Workspace Approval */}
              <button
                type="button"
                onClick={() => setAutoSubmitBlogs(!autoSubmitBlogs)}
                className="w-full px-4 py-2.5 hover:bg-cyan-500/20 hover:text-cyan-400 flex items-center gap-3 text-left transition-colors text-gray-300 rounded-lg"
                title="Toggle automatic blog submissions to the workspace approval queue"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Workspace approval</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      autoSubmitBlogs ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {autoSubmitBlogs ? 'On' : 'Off'}
                  </span>
                </div>
              </button>
              
              {/* Divider */}
              <div className="border-t border-gray-700 my-1"></div>
              
              {/* Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  setShowSettingsDropdown(false);
                }}
                className="w-full px-4 py-2.5 hover:bg-red-500/20 hover:text-red-400 flex items-center gap-3 text-left transition-colors text-gray-300 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

