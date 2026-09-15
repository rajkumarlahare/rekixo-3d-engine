export const ADMIN_BASE_PATH = "/3Dprojects" as const;
export const PUBLIC_BASE_PATH = "/3Dprojects" as const;
export const FIRST_PROJECT_SLUG = "jyoti-paradise" as const;

export type Project3DStatus = "draft" | "published" | "archived";

export type Scene3DType =
  | "project-navigation"
  | "section"
  | "wing-distance"
  | "balcony"
  | "typical-floor"
  | "amenity";

export interface Project3D {
  id: string;
  slug: string;
  name: string;
  location?: string;
  status: Project3DStatus;
  coverAssetKey?: string;
  defaultSceneId?: string;
}

export interface CameraPreset3D {
  id: string;
  projectId: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface Scene3D {
  id: string;
  projectId: string;
  name: string;
  type: Scene3DType;
  cameraPresetId?: string;
  sortOrder: number;
  enabled: boolean;
}
