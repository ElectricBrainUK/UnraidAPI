export interface Docker {
  details: {
    images: Record<string, DockerImage>;
    containers: Record<string, DockerContainer>;
  };
}

export interface DockerImage {
  imageUrl: string;
  imageId: string;
  created: string;
}

export interface DockerContainer {
  imageUrl?: string;
  name?: string;
  status?: string;
  containerId?: string;
  tag?: string;
  uptoDate?: string;
  imageId?: string;
  created?: string;
}
