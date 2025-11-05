import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Timestamp;
    status: string;
}

/**
 * Check if there are new contact submissions in the last 7 days
 */
export const hasNewMessages = async (): Promise<boolean> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const q = query(
            collection(db, 'contact_submissions'),
            where('createdAt', '>', Timestamp.fromDate(sevenDaysAgo)),
            where('status', '==', 'new')
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        return false;
    }
};

/**
 * Get count of new messages in the last 7 days
 */
export const getNewMessagesCount = async (): Promise<number> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const q = query(
            collection(db, 'contact_submissions'),
            where('createdAt', '>', Timestamp.fromDate(sevenDaysAgo)),
            where('status', '==', 'new')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        return 0;
    }
};
