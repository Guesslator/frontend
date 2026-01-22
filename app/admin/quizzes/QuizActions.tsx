"use client";

import { Eye, Trash2 } from "lucide-react";
import { deleteQuiz } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export default function QuizActions({ quizId, token }: { quizId: string, token: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this quiz? This action CANNOT be undone.")) return;

        setIsDeleting(true);
        try {
            await deleteQuiz(quizId, token);
            toast.success("Quiz deleted successfully");
            router.refresh();
        } catch (e) {
            toast.error("Failed to delete quiz");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-800 rounded transition-colors"
                title="Delete Quiz"
            >
                <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>
        </div>
    );
}
