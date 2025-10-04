import { initializeApp } from "firebase/app";
import { Request } from "express";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { firebaseConfig } from "../firebase";


initializeApp(firebaseConfig);
const storageFirebase = getStorage();

export const uploadFileToFirebase = async (req: Request, archive: string, name: string) => {
    const storageRef = ref(storageFirebase, `/${archive}/${name}`);
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, { contentType: req.file!.mimetype });
    return await getDownloadURL(snapshot.ref);
}

export const uploadFileByNameToFirebase = async (
    req: Request, 
    archive: string, 
    name: string, 
    fieldName: string
): Promise<string> => {
    const files = req.files as Array<any>;
    const file = files.find((fileTemp: Express.Multer.File) => fileTemp.fieldname === fieldName);
    
    if (!file) {
        return "";
    }

    const storageRef = ref(storageFirebase, `/${archive}/${name}`);
    const snapshot = await uploadBytesResumable(storageRef, file.buffer, { contentType: file.mimetype });
    return await getDownloadURL(snapshot.ref);
};