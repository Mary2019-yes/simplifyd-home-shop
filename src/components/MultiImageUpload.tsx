import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Upload, X, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "./ui/progress";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageData {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
  displayOrder: number;
}

interface MultiImageUploadProps {
  productId: string;
  existingImages?: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  minImages?: number;
  maxImages?: number;
}

const SortableImage = ({ image, onRemove }: { image: ImageData; onRemove: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square bg-muted rounded-lg overflow-hidden"
    >
      <img src={image.url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          size="icon"
          variant="destructive"
          onClick={() => onRemove(image.id)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-6 w-6 text-white" />
        </div>
      </div>
      {image.isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          Primary
        </div>
      )}
    </div>
  );
};

export const MultiImageUpload = ({
  productId,
  existingImages = [],
  onImagesChange,
  minImages = 1,
  maxImages = 8,
}: MultiImageUploadProps) => {
  const [images, setImages] = useState<ImageData[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to compress image"));
            },
            "image/jpeg",
            0.8
          );
        };
      };
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG, and WebP images are allowed",
        variant: "destructive",
      });
    }

    setUploading(true);
    const newImages: ImageData[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setProgress(((i + 1) / validFiles.length) * 100);

      try {
        const compressedBlob = await compressImage(file);
        const fileName = `${productId}/${Date.now()}-${i}.jpg`;
        
        const { error: uploadError, data } = await supabase.storage
          .from("product-images")
          .upload(fileName, compressedBlob, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        newImages.push({
          id: `temp-${Date.now()}-${i}`,
          url: publicUrl,
          isPrimary: images.length === 0 && i === 0,
          displayOrder: images.length + i,
        });
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setUploading(false);
    setProgress(0);
  };

  const handleRemove = async (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      const fileName = imageToRemove.url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([`${productId}/${fileName}`]);
      }
    }

    const updatedImages = images.filter((img) => img.id !== id);
    if (updatedImages.length > 0 && imageToRemove?.isPrimary) {
      updatedImages[0].isPrimary = true;
    }
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          displayOrder: index,
          isPrimary: index === 0,
        }));
        onImagesChange(newItems);
        return newItems;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Upload {minImages}-{maxImages} images (JPG, PNG, WebP)
        </p>
        <Button
          variant="outline"
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          <Upload className="mr-2 h-4 w-4" />
          Add Images
        </Button>
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && <Progress value={progress} className="w-full" />}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <SortableImage key={image.id} image={image} onRemove={handleRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {images.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};