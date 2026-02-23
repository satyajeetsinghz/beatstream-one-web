import { useState } from "react";
import { useSections } from "../hooks/useSections";
import {
    createSection,
    deleteSection,
    toggleSectionStatus,
    updateSection,
} from "../services/section.service";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';

export const SectionManager = () => {
    const { sections, loading } = useSections();

    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newTitle.trim()) return;

        try {
            setCreating(true);
            await createSection(newTitle);
            setNewTitle("");
        } catch {
            alert("Error creating section");
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingId || !editingTitle.trim()) return;

        try {
            await updateSection(editingId, editingTitle);
            setEditingId(null);
            setEditingTitle("");
        } catch (error) {
            console.error("Update Section Error:", error);
            alert("Error updating section");
        }

    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            setTogglingId(id);
            await toggleSectionStatus(id, currentStatus);
        } catch (error) {
            console.error("Error toggling section:", error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this section?")) return;

        try {
            setDeletingId(id);
            await deleteSection(id);
        } catch (error) {
            console.error("Error deleting section:", error);
        } finally {
            setDeletingId(null);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>

                {/* Create Section Skeleton */}
                <div className="flex gap-2 mb-6">
                    <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Sections List Skeleton */}
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <FolderIcon className="text-gray-400" fontSize="small" />
                    <h2 className="text-lg font-semibold text-gray-900">Section Management</h2>
                    <span className="text-xs text-gray-400 ml-1">
                        {sections.length} {sections.length === 1 ? 'section' : 'sections'}
                    </span>
                </div>
            </div>

            {/* Create Section */}
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="New section title"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating || !newTitle.trim()}
                        className="px-5 py-2.5 bg-[#FA2E6E] text-white text-sm font-medium rounded-full hover:bg-[#E01E5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        {creating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <AddIcon fontSize="small" />
                                <span>Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Sections List */}
            <div className="p-6">
                {sections.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FolderIcon className="text-gray-400" style={{ fontSize: 32 }} />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">No sections yet</p>
                        <p className="text-xs text-gray-400">Create your first section above</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                className="group relative bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all overflow-hidden"
                            >
                                {editingId === section.id ? (
                                    /* Edit Mode */
                                    <div className="p-4">
                                        <div className="flex gap-2">
                                            <input
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                placeholder="Section title"
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E]"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                            />
                                            <button
                                                onClick={handleUpdate}
                                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                title="Save"
                                            >
                                                <CheckIcon fontSize="small" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditingTitle("");
                                                }}
                                                className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                                                title="Cancel"
                                            >
                                                <CloseIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode */
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            {/* Section Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                        {section.title}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${section.isActive
                                                            ? 'bg-green-50 text-green-600 border border-green-200'
                                                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                        }`}>
                                                        {section.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>

                                                {/* Optional: Add item count if available */}
                                                {section.itemCount !== undefined && (
                                                    <p className="text-xs text-gray-400">
                                                        {section.itemCount} items
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 ml-4">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => {
                                                        setEditingId(section.id);
                                                        setEditingTitle(section.title);
                                                    }}
                                                    className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
                                                    title="Edit section"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </button>

                                                {/* Toggle Active/Inactive */}
                                                <button
                                                    onClick={() => handleToggle(section.id, section.isActive)}
                                                    disabled={togglingId === section.id}
                                                    className={`p-2 rounded-full transition-all duration-200 ${section.isActive
                                                            ? 'text-green-600 hover:bg-green-50'
                                                            : 'text-gray-400 hover:bg-gray-200'
                                                        } ${togglingId === section.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={section.isActive ? 'Disable section' : 'Enable section'}
                                                >
                                                    {togglingId === section.id ? (
                                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : section.isActive ? (
                                                        <VisibilityIcon fontSize="small" />
                                                    ) : (
                                                        <VisibilityOffIcon fontSize="small" />
                                                    )}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(section.id)}
                                                    disabled={deletingId === section.id}
                                                    className={`p-2 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 ${deletingId === section.id ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    title="Delete section"
                                                >
                                                    {deletingId === section.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};