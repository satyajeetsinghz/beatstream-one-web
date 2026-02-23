import { useState } from "react";
import {
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { useBanners } from "../hooks/useBanners";
import { useSongs } from "@/features/songs/hooks/useSongs";
import BannerFormModal from "./BannerModalForm";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ImageIcon from '@mui/icons-material/Image';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";
import SortableBannerItem from "./SortableBannerItem";
import { IBanner } from "../types";

const BannerManager = () => {
    const { banners, loading } = useBanners(true);
    const { songs } = useSongs();
    const [selectedBanner, setSelectedBanner] = useState<IBanner | null>(null);
    const [open, setOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this banner?");
        if (!confirmDelete) return;

        try {
            setDeletingId(id);
            await deleteDoc(doc(db, "banners", id));
            
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete banner");
        } finally {
            setDeletingId(null);
        }
    };

    const toggleActive = async (banner: IBanner) => {
        try {
            setTogglingId(banner.id);
            await updateDoc(doc(db, "banners", banner.id), {
                isActive: !banner.isActive,
            });
            
        } catch (error) {
            console.error("Toggle error:", error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setIsDragging(false);

        const oldIndex = banners.findIndex(b => b.id === active.id);
        const newIndex = banners.findIndex(b => b.id === over.id);

        const reordered = arrayMove(banners, oldIndex, newIndex);

        // Update order in Firebase
        try {
            await Promise.all(
                reordered.map((banner, index) =>
                    updateDoc(doc(db, "banners", banner.id), {
                        order: index + 1,
                    })
                )
            );
            
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragCancel = () => {
        setIsDragging(false);
    };

    // Helper function to get display text for redirect ID
    const getRedirectDisplay = (banner: IBanner) => {
        if (banner.redirectType === 'song') {
            const song = songs.find(s => s.id === banner.redirectId);
            return song ? `${song.title} - ${song.artist}` : banner.redirectId;
        }
        return banner.redirectId;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-[#fea1be] border-t-[#FA2E6E] rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-400">Loading banners...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="text-gray-400" fontSize="small" />
                        <h2 className="text-lg font-semibold text-gray-900">Banner Management</h2>
                        <span className="text-xs text-gray-400 ml-1">
                            {banners.length} {banners.length === 1 ? 'banner' : 'banners'}
                        </span>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedBanner(null);
                            setOpen(true);
                        }}
                        className="flex items-center gap-1 px-4 py-2 bg-[#FA2E6E] text-white text-sm font-medium rounded-full hover:bg-[#E01E5A] transition-colors shadow-sm"
                    >
                        <AddIcon fontSize="small" />
                        <span>Create Banner</span>
                    </button>
                </div>
            </div>

            {/* Drag & Drop Context */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext
                    items={banners.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {/* Banners List */}
                    <div className="p-6">
                        {banners.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <ImageIcon className="text-gray-400" style={{ fontSize: 32 }} />
                                </div>
                                <p className="text-sm text-gray-500 mb-1">No banners yet</p>
                                <p className="text-xs text-gray-400">Create your first banner to get started</p>
                            </div>
                        ) : (
                            <div className={`space-y-3 ${isDragging ? 'cursor-grabbing' : ''}`}>
                                {banners.map((banner) => (
                                    <SortableBannerItem key={banner.id} id={banner.id} banner={banner}>
                                        <div className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                            {/* Drag Handle */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                                    <DragIndicatorIcon fontSize="small" />
                                                </div>

                                                {/* Banner Image */}
                                                <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-200 shadow-sm flex-shrink-0">
                                                    {banner.imageUrl ? (
                                                        <img
                                                            src={banner.imageUrl}
                                                            alt={banner.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                            <ImageIcon className="text-gray-400" fontSize="small" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Banner Details */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                            {banner.title}
                                                        </h3>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            banner.isActive
                                                                ? 'bg-green-50 text-green-600 border border-green-200'
                                                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                            }`}>
                                                            {banner.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="capitalize">Type: {banner.redirectType}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="truncate max-w-[200px]">
                                                            {banner.redirectType === 'song' 
                                                                ? getRedirectDisplay(banner)
                                                                : `ID: ${banner.redirectId}`
                                                            }
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span>Order: {banner.order || 1}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 ml-4">
                                                {/* Toggle Active/Inactive */}
                                                <button
                                                    onClick={() => toggleActive(banner)}
                                                    disabled={togglingId === banner.id}
                                                    className={`p-2 rounded-full transition-all duration-200 ${
                                                        banner.isActive
                                                            ? 'text-green-600 hover:bg-green-50'
                                                            : 'text-gray-400 hover:bg-gray-200'
                                                        } ${togglingId === banner.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={banner.isActive ? 'Deactivate banner' : 'Activate banner'}
                                                >
                                                    {togglingId === banner.id ? (
                                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : banner.isActive ? (
                                                        <VisibilityIcon fontSize="small" />
                                                    ) : (
                                                        <VisibilityOffIcon fontSize="small" />
                                                    )}
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedBanner(banner);
                                                        setOpen(true);
                                                    }}
                                                    className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                                    title="Edit banner"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(banner.id)}
                                                    disabled={deletingId === banner.id}
                                                    className={`p-2 rounded-full transition-all ${
                                                        deletingId === banner.id
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-red-400 hover:text-red-500 hover:bg-red-50'
                                                        }`}
                                                    title="Delete banner"
                                                >
                                                    {deletingId === banner.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                                                    ) : (
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </SortableBannerItem>
                                ))}
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <p className="text-xs text-gray-400">
                    Drag banners by the handle to reorder. Order determines display sequence.
                </p>
            </div>

            {/* Modal */}
            {open && (
                <BannerFormModal
                    banner={selectedBanner}
                    onClose={() => {
                        setOpen(false);
                        
                    }}
                />
            )}
        </div>
    );
};

export default BannerManager;