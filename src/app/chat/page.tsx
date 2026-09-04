"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Settings2, 
  Send, 
  ImageIcon, 
  MoreVertical, 
  ArrowLeft, 
  UserPlus, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  User,
  X,
  Check,
  Zap,
  LogOut,
  Smile,
  Trash2,
  Lock,
  Eye,
  Camera,
  MoreHorizontal,
  ChevronRight,
  Archive,
  Star,
  Pin,
  PinOff,
  Circle,
  Edit3,
  Phone,
  Video,
  Info,
  Mic,
  Reply,
  VolumeX,
  Volume2,
  Ban,
  UserMinus,
  Bell,
  BellOff,
  UserCheck,
  History,
  CornerDownLeft,
  ChevronLeft,
  Copy,
  Maximize2,
  Play,
  Activity,
  Forward,
  FileText,
  FileVideo,
  FileArchive,
  ChevronDown,
  MoreHorizontal as MoreIcon,
  Heart,
  Paperclip,
  Users,
  CameraIcon,
  Eraser,
  Upload as UploadIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser, useFirestore, useCollection, useAuth } from '@/firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { uploadAvatarAction } from './actions';

// --- Types ---
interface ChatUser {
  uid: string;
  username: string;
  username_lowercase: string;
  displayName: string;
  photoURL?: string;
  about?: string;
  isOnline: boolean;
  lastSeen: any;
  blockedUsers?: string[];
  archivedChats?: string[];
  privacy?: {
    lastSeen: boolean;
    readReceipts: boolean;
    photo: 'everyone' | 'friends';
  };
}

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  videoThumb?: string;
  timestamp: any;
  status: 'sent' | 'seen';
  replyTo?: { id: string, text: string, sender: string };
  deletedFor?: string[];
}

interface Chat {
  id: string;
  participants: string[];
  isGroup?: boolean;
  groupName?: string;
  groupAdmin?: string;
  groupAvatar?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
  };
  unreadCount?: Record<string, number>;
  pinnedBy?: string[];
  mutedBy?: string[];
  typing?: Record<string, boolean>;
  peer?: ChatUser; 
}

interface FriendRequest {
  id: string;
  from: string;
  fromName: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: any;
}

/**
 * Standardized Chat Avatar Component
 * Handles the "empty" state requested for removed DPs
 */
const ChatAvatar = ({ src, className }: { src?: string, className?: string }) => (
  <div className={cn("relative shrink-0 overflow-hidden bg-secondary border border-white/5 flex items-center justify-center", className)}>
    {src ? (
      <img src={src} className="w-full h-full object-cover" alt="" />
    ) : (
      <div className="w-full h-full bg-secondary" />
    )}
  </div>
);

export default function ChatAppPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  
  // App Identity State
  const [profile, setProfile] = useState<ChatUser | null>(null);
  const [setupUsername, setSetupUsername] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  
  // Navigation State
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'status' | 'friends' | 'requests'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // Interaction State
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  
  // Modals
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showRemoveAvatarConfirm, setShowRemoveAvatarConfirm] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- 1. Identity & Presence Logic ---
  useEffect(() => {
    if (!db || !user) return;
    const userRef = doc(db, 'chat_users', user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as ChatUser);
        updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() }).catch(() => {});
      }
    });

    const handleVisibility = () => {
      if (!user || !db) return;
      const isOnline = document.visibilityState === 'visible';
      updateDoc(doc(db, 'chat_users', user.uid), { isOnline, lastSeen: serverTimestamp() }).catch(() => {});
    };

    window.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      if (user && db) updateDoc(doc(db, 'chat_users', user.uid), { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {});
      unsub();
    };
  }, [db, user]);

  const handleSetupProfile = async () => {
    if (!db || !user || !setupUsername.trim()) return;
    setIsSettingUp(true);
    const cleanUsername = setupUsername.trim().toLowerCase();

    try {
      const q = query(collection(db, 'chat_users'), where('username_lowercase', '==', cleanUsername));
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast({ variant: "destructive", title: "Identity Conflict", description: "Username is already occupied in the matrix." });
        setIsSettingUp(false);
        return;
      }

      const payload: ChatUser = {
        uid: user.uid,
        username: setupUsername.trim(),
        username_lowercase: cleanUsername,
        displayName: user.displayName || setupUsername.trim(),
        isOnline: true,
        lastSeen: serverTimestamp(),
        blockedUsers: [],
        archivedChats: [],
        privacy: { lastSeen: true, readReceipts: true, photo: 'everyone' }
      };

      await setDoc(doc(db, 'chat_users', user.uid), payload);
      toast({ title: "Signal Established", description: "Your chat identity is now live." });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Error" });
    } finally {
      setIsSettingUp(false);
    }
  };

  /**
   * ImgBB Avatar Upload Protocol
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !db) return;

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const res = await uploadAvatarAction(base64);
      
      if (res.success && res.url) {
        const userRef = doc(db, 'chat_users', user.uid);
        await updateDoc(userRef, { photoURL: res.url });
        toast({ title: "Identity Scaled", description: "Profile photo updated via ImgBB node." });
      } else {
        throw new Error(res.error || "Handshake failed");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Uplink Failed", description: err.message });
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  /**
   * Remove Avatar Protocol
   */
  const handleRemoveAvatar = async () => {
    if (!user || !db) return;
    setIsUploadingAvatar(true);
    try {
      const userRef = doc(db, 'chat_users', user.uid);
      await updateDoc(userRef, { photoURL: null });
      toast({ title: "Identity Sanitized", description: "Profile photo purged from matrix." });
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsUploadingAvatar(false);
      setShowRemoveAvatarConfirm(false);
    }
  };

  // --- 2. Data Stream Matrix ---
  const chatsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
  }, [db, user]);

  const { data: rawChats, loading: chatsLoading } = useCollection<Chat>(chatsQuery);
  const [chatPeers, setChatPeers] = useState<Record<string, ChatUser>>({});

  useEffect(() => {
    if (!db || !rawChats || !user) return;
    rawChats.forEach(chat => {
      if (chat.isGroup) return;
      const peerId = chat.participants.find(id => id !== user.uid);
      if (peerId) {
        onSnapshot(doc(db, 'chat_users', peerId), (snap) => {
          if (snap.exists()) {
            setChatPeers(prev => ({ ...prev, [peerId]: snap.data() as ChatUser }));
          }
        });
      }
    });
  }, [db, rawChats, user]);

  const chats = useMemo(() => {
    if (!rawChats || !user) return [];
    return rawChats
      .filter(c => !profile?.archivedChats?.includes(c.id))
      .map(c => ({
        ...c,
        peer: c.isGroup ? undefined : chatPeers[c.participants.find(id => id !== user.uid) || '']
      }))
      .sort((a, b) => {
        const aPinned = a.pinnedBy?.includes(user.uid);
        const bPinned = b.pinnedBy?.includes(user.uid);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return (b.lastMessage?.timestamp?.toMillis?.() || 0) - (a.lastMessage?.timestamp?.toMillis?.() || 0);
      });
  }, [rawChats, chatPeers, user, profile?.archivedChats]);

  const unreadCount = useMemo(() => {
    if (!chats || !user) return 0;
    return chats.reduce((acc, chat) => acc + (chat.unreadCount?.[user.uid] || 0), 0);
  }, [chats, user]);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  const messagesQuery = useMemo(() => {
    if (!db || !activeChatId) return null;
    return query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'), limit(200));
  }, [db, activeChatId]);
  
  const { data: rawMessages } = useCollection<Message>(messagesQuery);
  const messages = useMemo(() => {
    if (!rawMessages || !user) return [];
    return rawMessages.filter(m => !m.deletedFor?.includes(user.uid));
  }, [rawMessages, user]);

  const requestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'friend_requests'), where('to', '==', user.uid), where('status', '==', 'pending'));
  }, [db, user]);
  const { data: incomingRequests } = useCollection<FriendRequest>(requestsQuery);

  // --- 3. Communication Protocols ---
  const handleSendMessage = async (payload: any) => {
    if (!db || !user || !activeChatId) return;
    
    const chatRef = doc(db, 'chats', activeChatId);
    const msgPayload = {
      senderId: user.uid,
      senderName: profile?.displayName,
      timestamp: serverTimestamp(),
      status: 'sent',
      deletedFor: [],
      ...payload,
      ...(replyingTo && { replyTo: { id: replyingTo.id, text: replyingTo.text || 'Media', sender: replyingTo.senderId === user.uid ? 'You' : (replyingTo.senderName || 'Peer') } })
    };

    try {
      await addDoc(collection(chatRef, 'messages'), msgPayload);
      
      const updates: any = {
        lastMessage: {
          text: payload.text || 'Media',
          senderId: user.uid,
          timestamp: serverTimestamp()
        }
      };

      activeChat?.participants.forEach(pId => {
        if (pId !== user.uid) {
          updates[`unreadCount.${pId}`] = increment(1);
        }
      });

      await updateDoc(chatRef, updates);
      setMessageInput('');
      setReplyingTo(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Signal Lost" });
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const res = await uploadAvatarAction(base64);
      if (res.success && res.url) {
        await handleSendMessage({ imageUrl: res.url });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Transmission Failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChatInputChange = (val: string) => {
    setMessageInput(val);
    if (!db || !activeChatId || !user) return;
    const chatRef = doc(db, 'chats', activeChatId);
    updateDoc(chatRef, { [`typing.${user.uid}`]: val.length > 0 });
  };

  const handlePinChat = (id: string, isPinned: boolean) => {
    if (!db || !user) return;
    updateDoc(doc(db, 'chats', id), {
      pinnedBy: isPinned ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const handleArchiveChat = (id: string) => {
    if (!db || !user) return;
    updateDoc(doc(db, 'chat_users', user.uid), {
      archivedChats: arrayUnion(id)
    });
    setActiveChatId(null);
    toast({ title: "Stream Archived" });
  };

  const searchUsers = async () => {
    if (!db || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'chat_users'), 
        where('username_lowercase', '>=', searchQuery.toLowerCase()), 
        where('username_lowercase', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(5)
      );
      const snap = await getDocs(q);
      setUserSearchResults(snap.docs.map(d => d.data() as ChatUser).filter(u => u.uid !== user?.uid));
    } catch (e) {
      toast({ variant: "destructive", title: "Search Error" });
    } finally {
      setIsSearching(false);
    }
  };

  const acceptRequest = async (req: FriendRequest) => {
    if (!db || !user) return;
    try {
      const chatId = user.uid < req.from ? `${user.uid}_${req.from}` : `${req.from}_${user.uid}`;
      await setDoc(doc(db, 'chats', chatId), {
        id: chatId,
        participants: [user.uid, req.from],
        timestamp: serverTimestamp(),
        lastMessage: { text: "Protocol Linked.", senderId: 'system', timestamp: serverTimestamp() },
        unreadCount: { [user.uid]: 0, [req.from]: 0 },
        pinnedBy: [],
        mutedBy: []
      });
      await deleteDoc(doc(db, 'friend_requests', req.id));
      toast({ title: "Linked" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failure" });
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageDateLabel = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'TODAY';
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0c]"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0c] p-6">
      <Card className="glass-card border-white/5 shadow-2xl p-12 text-center flex flex-col items-center gap-10 rounded-[3rem] max-w-lg w-full">
         <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl"><Lock className="w-8 h-8" /></div>
         <div className="space-y-3">
            <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">Identity Required</h2>
            <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em]">Sign in to initialize secure communications.</p>
         </div>
         <Button asChild className="h-16 w-full bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary/30">
            <Link href="/login?redirect=/chat">Initialize Session</Link>
         </Button>
      </Card>
    </div>
  );

  if (!profile) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0c] p-6">
      <Card className="glass-card border-white/5 shadow-2xl p-10 space-y-10 rounded-[2.5rem] max-w-md w-full">
         <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20"><UserPlus className="w-8 h-8" /></div>
            <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Identity Forge</h2>
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">Establish your studio handle</p>
         </div>
         <div className="space-y-6">
            <Input value={setupUsername} onChange={e => setSetupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="USERNAME IDENTIFIER" className="h-14 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-center" />
            <Button onClick={handleSetupProfile} disabled={isSettingUp || !setupUsername.trim()} className="w-full h-16 bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-xl">
               {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-3" />} Activate
            </Button>
         </div>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 top-16 bg-[#060608] flex overflow-hidden z-50">
      
      {/* SIDEBAR */}
      <aside className={cn(
        "w-full lg:w-[440px] border-r border-white/5 flex flex-col bg-[#0d0d0f] transition-all duration-500 z-30",
        activeChatId && "max-lg:hidden"
      )}>
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40">
           <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowSettings(true)}>
              <div className="relative group/nav-avatar">
                <ChatAvatar src={profile.photoURL} className="w-12 h-12 rounded-2xl shadow-lg" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl opacity-0 group-hover/nav-avatar:opacity-100 transition-opacity flex items-center justify-center">
                   <Settings2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest truncate">{profile.username}</h2>
                 <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Linked</p>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <Button onClick={() => setShowAddFriend(true)} variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-primary"><UserPlus className="w-5 h-5" /></Button>
              <Button onClick={() => setShowCreateGroup(true)} variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-primary"><Users className="w-5 h-5" /></Button>
              <DropdownMenu>
                 <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white"><MoreVertical className="w-5 h-5" /></Button></DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="glass-card border-white/10 w-52">
                    <DropdownMenuItem onClick={() => setShowSettings(true)} className="text-[9px] font-black uppercase"><Settings2 className="w-3.5 h-3.5 mr-2" /> Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-[9px] font-black uppercase"><Archive className="w-3.5 h-3.5 mr-2" /> Archived</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => setShowLeaveConfirm(true)} className="text-[9px] font-black uppercase text-red-500"><LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out</DropdownMenuItem>
                 </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </header>

        <div className="grid grid-cols-4 h-14 border-b border-white/5 bg-black/40 shrink-0">
           {[
             { id: 'chats', label: 'CHATS', icon: MessageSquare, badge: unreadCount },
             { id: 'status', label: 'STATUS', icon: Activity, badge: 0 },
             { id: 'friends', label: 'PEERS', icon: User, badge: 0 },
             { id: 'requests', label: 'UPLINKS', icon: Zap, badge: incomingRequests?.length || 0 }
           ].map(tab => (
             <button key={tab.id} onClick={() => setSidebarTab(tab.id as any)} className={cn("flex flex-col items-center justify-center gap-1 transition-all relative", sidebarTab === tab.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-foreground/20 hover:text-foreground/40")}>
                <tab.icon className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                {tab.badge > 0 && <div className="absolute top-2 right-4 w-4 h-4 rounded-full bg-primary text-white text-[7px] font-black flex items-center justify-center">{tab.badge}</div>}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
           {sidebarTab === 'chats' && (
             <>
               {chatsLoading ? (
                 <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20 mx-auto" /></div>
               ) : chats.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 grayscale">
                    <MessageSquare className="w-16 h-16" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Streams</p>
                 </div>
               ) : chats.map(chat => (
                 <button key={chat.id} onClick={() => { setActiveChatId(chat.id); if (chat.unreadCount?.[user.uid]) updateDoc(doc(db!, 'chats', chat.id), { [`unreadCount.${user.uid}`]: 0 }); }} className={cn("w-full p-4 rounded-[2rem] flex items-center gap-4 transition-all group relative", activeChatId === chat.id ? "bg-primary/10 border border-primary/20 shadow-inner" : "hover:bg-white/5 border border-transparent")}>
                    <div className="relative shrink-0">
                       <ChatAvatar src={chat.isGroup ? chat.groupAvatar : chat.peer?.photoURL} className="w-14 h-14 rounded-2xl shadow-md" />
                       {!chat.isGroup && chat.peer?.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-[#0d0d0f]" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                       <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[13px] font-black text-white uppercase tracking-tight truncate">{chat.isGroup ? chat.groupName : chat.peer?.username || 'Node...'}</h4>
                          <span className="text-[8px] font-bold text-foreground/20 uppercase whitespace-nowrap">{chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}</span>
                       </div>
                       <div className="flex items-center justify-between gap-4">
                          <p className="text-[11px] font-medium text-foreground/40 truncate uppercase tracking-tighter flex-1">{chat.lastMessage?.senderId === user.uid && <Check className="w-3 h-3 inline mr-1 text-primary" />}{chat.lastMessage?.text || 'Linked'}</p>
                          {chat.unreadCount?.[user.uid] ? <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-lg">{chat.unreadCount[user.uid]}</div> : null}
                       </div>
                    </div>
                 </button>
               ))}
             </>
           )}

           {sidebarTab === 'status' && (
              <div className="p-4 space-y-6">
                 <div className="p-6 rounded-[2.5rem] bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Plus className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Update Status</span>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-foreground/20 uppercase px-2">Recent Matrix Updates</p>
                    <div className="flex flex-col items-center justify-center py-20 opacity-10">
                       <Activity className="w-10 h-10" />
                       <p className="text-[9px] font-black uppercase mt-2">Zero Status Signals</p>
                    </div>
                 </div>
              </div>
           )}

           {sidebarTab === 'friends' && (
              <div className="p-4 space-y-4">
                 <p className="text-[9px] font-black text-foreground/20 uppercase px-2">Verified Peers</p>
                 {chats.filter(c => !c.isGroup).map(chat => (
                   <div key={chat.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4 min-w-0">
                         <ChatAvatar src={chat.peer?.photoURL} className="w-10 h-10 rounded-xl" />
                         <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate uppercase">{chat.peer?.username}</p>
                            <p className="text-[9px] text-foreground/30 truncate uppercase">{chat.peer?.about}</p>
                         </div>
                      </div>
                      <button onClick={() => setActiveChatId(chat.id)} className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><MessageSquare className="w-5 h-5" /></button>
                   </div>
                 ))}
              </div>
           )}

           {sidebarTab === 'requests' && (
              <div className="p-4 space-y-4">
                 <p className="text-[9px] font-black text-foreground/20 uppercase px-2">Inbound Signals</p>
                 {incomingRequests?.length === 0 ? (
                   <div className="py-20 text-center opacity-10">
                      <Activity className="w-10 h-10 mx-auto" />
                      <p className="text-[9px] font-black uppercase tracking-widest mt-2">Zero Inbound Signals</p>
                   </div>
                 ) : incomingRequests?.map(req => (
                   <div key={req.id} className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <div className="min-w-0">
                         <p className="text-[11px] font-bold text-white uppercase">{req.fromName}</p>
                         <p className="text-[8px] text-foreground/20 uppercase tracking-widest">Protocol Handshake</p>
                      </div>
                      <div className="flex gap-2">
                         <Button onClick={() => acceptRequest(req)} size="sm" className="h-8 px-3 rounded-lg bg-primary text-[8px] font-black uppercase">Accept</Button>
                         <Button onClick={() => deleteDoc(doc(db!, 'friend_requests', req.id))} variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-red-500 bg-red-500/10 text-[8px] font-black uppercase">Ignore</Button>
                      </div>
                   </div>
                 ))}
              </div>
           )}
        </div>
      </aside>

      {/* CHAT VIEWPORT */}
      <main className="flex-1 flex flex-col relative bg-[#060608] overflow-hidden">
         {activeChat ? (
           <>
             <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4 min-w-0">
                   <button onClick={() => setActiveChatId(null)} className="lg:hidden p-2 text-white/40 hover:text-white"><ChevronLeft className="w-6 h-6" /></button>
                   <ChatAvatar src={activeChat.isGroup ? activeChat.groupAvatar : activeChat.peer?.photoURL} className="w-12 h-12 rounded-2xl" />
                   <div className="min-w-0">
                      <h2 className="text-base font-black text-white uppercase tracking-tight truncate">{activeChat.isGroup ? activeChat.groupName : activeChat.peer?.username}</h2>
                      <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest mt-1">
                        {activeChat.isGroup ? `${activeChat.participants.length} Members` : activeChat.peer?.isOnline ? 'Online' : 'Offline'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Phone className="w-5 h-5" /></Button>
                   <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Video className="w-5 h-5" /></Button>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><MoreHorizontal className="w-5 h-5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card w-52">
                         <DropdownMenuItem onClick={() => handlePinChat(activeChat.id, activeChat.pinnedBy?.includes(user.uid) || false)} className="text-[9px] font-black uppercase"><Pin className="w-3.5 h-3.5 mr-2" /> Pin</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleArchiveChat(activeChat.id)} className="text-[9px] font-black uppercase"><Archive className="w-3.5 h-3.5 mr-2" /> Archive</DropdownMenuItem>
                         <DropdownMenuSeparator className="bg-white/5" />
                         <DropdownMenuItem onClick={() => { setActiveChatId(null); toast({title: "Stream Decoupled"}); }} className="text-[9px] font-black uppercase text-red-500"><X className="w-3.5 h-3.5 mr-2" /> Close Chat</DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
             </header>

             <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#060608]">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user.uid;
                  const showDate = i === 0 || getMessageDateLabel(msg.timestamp) !== getMessageDateLabel(messages[i-1].timestamp);
                  return (
                    <React.Fragment key={msg.id}>
                       {showDate && (
                         <div className="flex justify-center my-8">
                            <Badge variant="outline" className="bg-white/5 text-[8px] font-black uppercase tracking-[0.3em] border-white/10 px-4 py-1 rounded-full text-foreground/40">{getMessageDateLabel(msg.timestamp)}</Badge>
                         </div>
                       )}
                       <div className={cn("flex flex-col gap-1.5", isMe ? "ml-auto items-end" : "mr-auto items-start animate-in slide-in-from-left-2")}>
                          <div className={cn("p-4 rounded-3xl shadow-xl relative group/msg transition-all border", isMe ? "bg-primary text-white rounded-tr-none border-primary/20" : "bg-secondary text-foreground rounded-tl-none border-white/5")}>
                             {msg.replyTo && (
                               <div className="mb-3 p-2 rounded-xl bg-black/20 border-l-4 border-white/40 text-[10px] opacity-70"><p className="font-black uppercase text-[8px] mb-1">{msg.replyTo.sender}</p><p className="truncate line-clamp-1">{msg.replyTo.text}</p></div>
                             )}
                             {msg.imageUrl && <div onClick={() => setShowMediaPreview({url: msg.imageUrl!, type: 'image'})} className="cursor-zoom-in mb-2"><img src={msg.imageUrl} className="max-h-[350px] w-auto rounded-2xl border border-white/10" alt="" /></div>}
                             {msg.text && <p className="text-[14px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                             <div className={cn("flex items-center gap-2 mt-2", isMe ? "justify-end text-white/40" : "justify-start text-foreground/20")}>
                                <span className="text-[8px] font-black uppercase">{formatTime(msg.timestamp)}</span>
                                {isMe && (msg.status === 'seen' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Check className="w-3.5 h-3.5" />)}
                             </div>
                          </div>
                       </div>
                    </React.Fragment>
                  );
                })}
             </div>

             <footer className="p-4 sm:p-6 bg-[#0a0a0c] border-t border-white/5 shrink-0 z-20">
                <div className="max-w-4xl mx-auto space-y-4">
                   {replyingTo && (
                     <div className="bg-primary/5 border border-primary/20 p-3 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 min-w-0"><Reply className="w-4 h-4 text-primary" /><div className="min-w-0"><p className="text-[8px] font-black text-primary uppercase">Replying to {replyingTo.senderName}</p><p className="text-[11px] text-foreground/60 truncate">{replyingTo.text || 'Media'}</p></div></div>
                        <button onClick={() => setReplyingTo(null)} className="p-1.5 text-foreground/20 hover:text-primary"><X className="w-4 h-4" /></button>
                     </div>
                   )}
                   <div className="flex items-end gap-3 relative">
                      <div className="flex gap-1.5 mb-1.5">
                         <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-primary transition-all"><Smile className="w-5 h-5" /></button>
                         <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-primary border border-white/5"><Paperclip className="w-5 h-5" /></button>
                         <input type="file" ref={fileInputRef} className="hidden" onChange={handleMediaUpload} />
                      </div>
                      <div className="flex-1">
                         <Textarea value={messageInput} onChange={e => handleChatInputChange(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage({ text: messageInput }); } }} placeholder="Draft encrypted signal..." className="min-h-[50px] max-h-[120px] bg-secondary/60 border-white/10 rounded-[1.5rem] text-[15px] font-medium px-6 py-3.5 focus:ring-primary/40 text-white resize-none" />
                      </div>
                      <Button onClick={() => handleSendMessage({ text: messageInput })} disabled={!messageInput.trim() || isUploading} className="h-12 w-12 rounded-full bg-primary text-white shadow-xl mb-1">{isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</Button>
                   </div>
                </div>
             </footer>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center gap-12 opacity-10 grayscale p-10 text-center">
              <div className="w-40 h-40 rounded-[4rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl"><MessageSquare className="w-20 h-20" /></div>
              <div className="space-y-3">
                 <h3 className="text-3xl font-headline font-black uppercase tracking-[0.6em]">Matrix Standby</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs mx-auto">Select a verified node to initialize synchronization.</p>
              </div>
           </div>
         )}
      </main>

      {/* OVERLAYS */}
      <Dialog open={!!showMediaPreview} onOpenChange={() => setShowMediaPreview(null)}>
         <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden h-[90vh]">
            {showMediaPreview?.type === 'image' ? (
              <img src={showMediaPreview.url} className="w-full h-full object-contain" alt="" />
            ) : (
              <video src={showMediaPreview?.url} controls autoPlay className="w-full h-full object-contain" />
            )}
         </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
         <DialogContent className="glass-card max-w-md p-0 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]">
            <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30 relative shrink-0">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
               <div className="flex flex-col items-center gap-6 relative z-10">
                  <div className="relative group/avatar-edit">
                    <ChatAvatar src={profile.photoURL} className={cn("w-32 h-32 rounded-[2.5rem] border-4 border-white/10 shadow-2xl transition-all", isUploadingAvatar && "opacity-50 blur-sm")} />
                    <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] opacity-0 group-hover/avatar-edit:opacity-100 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                       <CameraIcon className="w-8 h-8 text-white" />
                       <span className="text-[8px] font-black uppercase text-white tracking-widest">Update DP</span>
                    </div>
                    {isUploadingAvatar && <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-spin" />}
                  </div>
                  <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  
                  <div className="text-center space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">{profile.username}</DialogTitle>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{profile.displayName}</p>
                  </div>
               </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-[#0d0d0f]">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Identity Status (About)</Label>
                     <Textarea value={profile.about} onChange={e => updateDoc(doc(db!, 'chat_users', user.uid), { about: e.target.value.substring(0, 100) })} className="bg-secondary/50 rounded-2xl border-white/5 text-sm font-medium p-4 resize-none h-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <Button variant="outline" onClick={() => avatarInputRef.current?.click()} className="h-11 rounded-xl bg-white/5 border-white/10 text-[9px] font-black uppercase">
                        <UploadIcon className="w-3.5 h-3.5 mr-2" /> Upload DP
                     </Button>
                     <Button variant="outline" onClick={() => setShowRemoveAvatarConfirm(true)} className="h-11 rounded-xl bg-white/5 border-white/10 text-red-500/60 hover:text-red-500 text-[9px] font-black uppercase">
                        <Eraser className="w-3.5 h-3.5 mr-2" /> Remove
                     </Button>
                  </div>
               </div>
               
               <div className="space-y-4 pt-6 border-t border-white/5">
                  <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Privacy Controls</Label>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/5 group hover:border-primary/20 transition-all">
                     <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-white uppercase tracking-tight">Read Receipts</span>
                        <p className="text-[7px] text-white/20 uppercase font-black">Broadcast "seen" signals</p>
                     </div>
                     <Switch checked={profile.privacy?.readReceipts} onCheckedChange={(v) => updateDoc(doc(db!, 'chat_users', user.uid), { 'privacy.readReceipts': v })} />
                  </div>
               </div>
            </div>

            <DialogFooter className="p-8 border-t border-white/5 bg-black/40 shrink-0">
               <Button onClick={() => setShowLeaveConfirm(true)} variant="destructive" className="w-full h-14 rounded-2xl uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-red-500/10">
                  <LogOut className="w-4 h-4 mr-2" /> Terminate Session
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
         <DialogContent className="glass-card max-w-lg p-0 rounded-[2.5rem] overflow-hidden">
            <DialogHeader className="p-8 bg-secondary/20 border-b border-white/5">
               <DialogTitle className="text-xl font-black uppercase">Find Peer Node</DialogTitle>
            </DialogHeader>
            <div className="p-8 space-y-6">
               <div className="flex gap-2">
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ENTER HANDLE..." className="h-14 rounded-2xl bg-secondary/50 text-center text-lg font-black uppercase tracking-widest" />
                  <Button onClick={searchUsers} disabled={isSearching} className="h-14 w-14 rounded-2xl">{isSearching ? <Loader2 className="animate-spin" /> : <Search />}</Button>
               </div>
               <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar">
                  {userSearchResults.map(u => (
                    <div key={u.uid} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/20">
                       <div className="flex items-center gap-4">
                          <ChatAvatar src={u.photoURL} className="w-10 h-10 rounded-xl" />
                          <span className="text-[11px] font-bold text-white uppercase">{u.username}</span>
                       </div>
                       <Button onClick={async () => { await addDoc(collection(db!, 'friend_requests'), { from: user.uid, fromName: profile.username, to: u.uid, status: 'pending', timestamp: serverTimestamp() }); setShowAddFriend(false); toast({title: "Uplink Sent"}); }} size="sm" variant="ghost" className="h-10 px-5 rounded-xl bg-primary/10 text-primary uppercase text-[9px] font-black">Link</Button>
                    </div>
                  ))}
               </div>
            </div>
         </DialogContent>
      </Dialog>

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <LogOut className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Terminate Session</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">Are you sure you want to log out? Your identity will be preserved in the matrix but you will be disconnected from active streams.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl shadow-destructive/20">Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRemoveAvatarConfirm} onOpenChange={setShowRemoveAvatarConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
               <Trash2 className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Remove Photo</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">This will definitively purge your custom profile photo from the identity matrix. The circle will remain plain.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAvatar} className="h-12 flex-1 rounded-xl bg-red-500 text-white font-black uppercase text-[9px] shadow-xl shadow-red-500/20">Purge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
