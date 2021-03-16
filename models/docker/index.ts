export interface DockerImage {
  imageUrl: string;
  imageId: string;
  created: string;
}

export interface DockerImageMap {
  [key: string]: DockerImage;
}

export interface DockerContainer {
  imageUrl: string;
  name: string;
  status: string;
  containerId: string;
  tag: string;
}

export interface DockerContainerMap {
  [key: string]: DockerContainer;
}
