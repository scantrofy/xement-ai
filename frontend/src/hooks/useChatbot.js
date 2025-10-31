import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { collection, query, where, limit, onSnapshot, addDoc, writeBatch, doc, getDocs } from 'firebase/firestore';
import { fs_client } from '../config/firestore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('firebaseToken');
};

// Firestore chat history hook
export const useChatHistory = (isAuthenticated) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setMessages([]);
    setIsLoading(false);

    /* UNCOMMENT AFTER FIRESTORE SETUP:
    const userId = localStorage.getItem('userEmail');
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const chatHistoryRef = collection(fs_client, 'chat_history');
    const q = query(
      chatHistoryRef,
      where('userId', '==', userId),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(chatMessages);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
    */
  }, [isAuthenticated]);

  return { messages, isLoading };
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, userId, userName }) => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // TODO: Enable Firestore saving after setting up collection
      // For now, just call the backend API
      
      // Call backend chatbot endpoint
      const response = await axios.post(
        `${API_BASE_URL}/chatbot`,
        {
          message: message,
          user_id: userId,
          user_name: userName
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return response.data;
      
      /* UNCOMMENT AFTER FIRESTORE SETUP:
      // Save user message to Firestore first
      const chatHistoryRef = collection(fs_client, 'chat_history');
      await addDoc(chatHistoryRef, {
        userId: userId,
        userName: userName || 'User',
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        read: true
      });

      // Save assistant response to Firestore
      const assistantResponse = response.data.response || response.data.message || 'No response';
      await addDoc(chatHistoryRef, {
        userId: userId,
        userName: 'XementAI Assistant',
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
        read: false,
        metadata: {
          model: response.data.model || 'gemini',
          context_used: response.data.context_used || false
        }
      });
      */
    },
    onError: (error) => {
      // Error handling
    }
  });
};

export const useMarkMessagesAsRead = () => {
  return useMutation({
    mutationFn: async (messageIds) => {
      const batch = writeBatch(fs_client);
      
      messageIds.forEach(id => {
        const docRef = doc(fs_client, 'chat_history', id);
        batch.update(docRef, { read: true });
      });

      await batch.commit();
    }
  });
};

export const useClearChatHistory = () => {
  return useMutation({
    mutationFn: async (userId) => {
      const chatHistoryRef = collection(fs_client, 'chat_history');
      const q = query(chatHistoryRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const batch = writeBatch(fs_client);
      snapshot.docs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });

      await batch.commit();
    }
  });
};
