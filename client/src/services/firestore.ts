import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";

// Add a new document to a collection
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

// Get all documents from a collection
export const getDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return documents;
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
};

// Get a document by id from a collection
export const getDocumentById = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error getting document: ", error);
  }
};

// Update a document with a specific id
export const updateDocument = async (
  collectionName: string,
  id: string,
  updatedData: any
) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
    console.log("Document successfully updated");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};

// Delete a document by id
export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    console.log("Document successfully deleted");
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
};
