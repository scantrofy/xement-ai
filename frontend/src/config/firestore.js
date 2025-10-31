import { getFirestore } from 'firebase/firestore';
import app from './firebase';

export const fs_client = getFirestore(app);

export default fs_client;
