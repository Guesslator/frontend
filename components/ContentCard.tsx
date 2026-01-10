"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PlayCircle, Trash2, Film, Image as ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { deleteUserContent } from "@/lib/api";
import { t, Language } from "@/lib/i18n";
import { toast } from "sonner";

interface ContentCardProps {
    id: string;
    title: string;
    description: string;
    posterUrl: string;
    lang: string;
    index: number;
    creatorType?: 'ADMIN' | 'USER';
    creator?: { id: string; name: string; email: string };
    quizType?: 'TEXT' | 'VIDEO' | 'IMAGE';
}

export default function ContentCard({
    id,
    title,
    description,
    posterUrl,
    lang,
    index,
    creatorType,
    creator,
    quizType
}: ContentCardProps) {
    const { data: session } = useSession();
    const [deleting, setDeleting] = useState(false);

    const canDelete = creatorType === 'USER' && session?.user?.id === creator?.id;

    const getQuizTypeLabel = () => {
        switch (quizType) {
            case 'VIDEO':
                return { icon: Film, label: t(lang as Language, 'videoQuiz'), color: 'text-primary' };
            case 'IMAGE':
                return { icon: ImageIcon, label: t(lang as Language, 'imageQuiz'), color: 'text-secondary' };
            case 'TEXT':
            default:
                return { icon: PlayCircle, label: t(lang as Language, 'standardQuiz'), color: 'text-accent' };
        }
    };

    const quizTypeInfo = getQuizTypeLabel();

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        toast(t(lang as Language, 'confirmDelete'), {
            action: {
                label: t(lang as Language, 'deleteQuiz'),
                onClick: () => performDelete()
            },
            cancel: {
                label: t(lang as Language, 'cancel'),
                onClick: () => { },
            },
        });
    };

    const performDelete = async () => {
        setDeleting(true);
        if (!session?.accessToken) {
            toast.error('Not authenticated');
            setDeleting(false);
            return;
        }

        try {
            await deleteUserContent(session.accessToken, id);
            window.location.reload();
        } catch (err) {
            toast.error('Failed to delete');
            setDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="relative"
        >
            <Link href={`/${lang}/content/${id}`} className="group relative block aspect-video rounded-xl overflow-hidden bg-card shadow-lg border border-border">
                <img
                    src={posterUrl || '/placeholder-banner.jpg'}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-60"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-banner.jpg';
                    }}
                />

                {/* Quiz Type Badge */}
                {quizTypeInfo && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold bg-background/80 backdrop-blur-sm z-10 flex items-center gap-1.5 border border-border/50">
                        <quizTypeInfo.icon size={14} className={quizTypeInfo.color} />
                        <span className={quizTypeInfo.color}>{quizTypeInfo.label}</span>
                    </div>
                )}


                {/* Delete Button (only for own content) */}
                {canDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="absolute top-3 right-3 p-2 rounded-full bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-50 z-20"
                        title={t(lang as Language, 'deleteQuiz')}
                    >
                        <Trash2 size={16} className="text-white" />
                    </button>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                    <PlayCircle size={48} className="text-primary mb-4 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" />
                    <h3 className="text-xl font-bold text-foreground translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                        {description}
                    </p>
                </div>

                {/* Bottom Gradient for readability when not hovering */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-4 pointer-events-none group-hover:opacity-0 transition-opacity">
                    <h3 className="text-sm font-bold text-foreground truncate">{title}</h3>
                </div>
            </Link>
        </motion.div>
    );
}
