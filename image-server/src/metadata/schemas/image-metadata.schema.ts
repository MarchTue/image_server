import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ImageMetadataDocument = ImageMetadata & Document;

@Schema({
  timestamps: { createdAt: "uploaded_at", updatedAt: false }
})
export class ImageMetadata {
  @Prop({ required: true, unique: true, index: true })
  hash_sha256: string;

  @Prop({ required: true })
  object_key: string;

  @Prop({ required: true, default: 1 })
  reference_count: number;

  @Prop()
  mime_type: string;

  @Prop()
  width: number;

  @Prop()
  height: number;

  @Prop({ default: true })
  is_public: boolean;

}

export const ImageMetadataSchema = SchemaFactory.createForClass(ImageMetadata);