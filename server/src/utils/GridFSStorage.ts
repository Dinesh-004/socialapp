import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

interface GridFSStorageOptions {
    bucketName?: string;
}

export class GridFSStorage implements StorageEngine {
    private bucketName: string;

    constructor(options?: GridFSStorageOptions) {
        this.bucketName = options?.bucketName || 'uploads';
    }

    _handleFile(req: Request, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
        const db = mongoose.connection.db;
        if (!db) {
            return cb(new Error('Database connection likely not ready'));
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: this.bucketName
        });

        const filename = `${Date.now()}-${file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                originalname: file.originalname,
                contentType: file.mimetype
            }
        });

        file.stream.pipe(uploadStream);

        uploadStream.on('error', (err) => cb(err));
        uploadStream.on('finish', () => {
            cb(null, {
                filename: filename,
                size: uploadStream.length || 0, // 'length' is standard, fallback 0
                bucketName: this.bucketName,
                // @ts-ignore
                id: uploadStream.id
            } as any);
        });
    }

    _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void {
        const db = mongoose.connection.db;
        if (!db) return cb(null);

        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: this.bucketName
        });

        const fileObj = file as any;
        if (fileObj.id || fileObj.filename) {
            const promise = fileObj.id
                ? bucket.delete(fileObj.id)
                : bucket.find({ filename: fileObj.filename }).next()
                    .then(doc => doc ? bucket.delete(doc._id) : Promise.resolve());

            promise
                .then(() => cb(null))
                .catch((err: Error) => cb(err));
        } else {
            cb(null);
        }
    }
}
