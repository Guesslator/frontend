"use client";

import { Eye, Trash2, AlertTriangle, X } from "lucide-react";
import { deleteQuiz } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export default function QuizActions({ quizId, token }: { quizId: string, token: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteQuiz(quizId, token);
            toast.success("Quiz deleted successfully");
            setShowConfirm(false); // Close modal
            router.refresh();
        } catch (e) {
            toast.error("Failed to delete quiz");
            setIsDeleting(false); // Only re-enable if failed
        }
    };

    return (
        <>
            <div className="flex justify-end items-center gap-2">
                <Link
                    href={`/quiz/${quizId}`}
                    target="_blank"
                    className="p-2 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 rounded transition-colors"
                    title="Preview Quiz"
                >
                    <Eye className="w-4 h-4" />
                </Link>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-800 rounded transition-colors"
                    title="Delete Quiz"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Centered Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div
                        className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                                <AlertTriangle size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-white">Delete Quiz?</h3>

                            <p className="text-neutral-400 text-sm">
                                Are you sure you want to delete this quiz? This action cannot be undone and will remove all associated data.
                            </p>

                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
