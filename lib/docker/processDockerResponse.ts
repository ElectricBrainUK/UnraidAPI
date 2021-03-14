import { Containers } from '../unraid/types';

export function processDockerResponse(details) {
  let images: Record<string, string> = {};
  let containers: Containers;
  details.forEach((row) => {
    if (!row.content || !row.content.includes('undefined')) {
      let docker = {
        imageUrl: '',
        name: '',
        status: '',
        containerId: '',
        tag: '',
        uptoDate: '',
        imageId: '',
        created: '',
      };
      row.children.forEach((child, index) => {
        try {
          if (child.tags.class) {
            switch (child.tags.class) {
              case 'ct-name':
                docker.imageUrl = child.children[0].children[0].children[0].tags.src.split(
                  '?',
                )[0];
                if (child.children[0].children[1].children[0].children[0]) {
                  docker.name =
                    child.children[0].children[1].children[0].children[0].contents;
                } else {
                  docker.name =
                    child.children[0].children[1].children[0].contents;
                }
                if (child.children[0].children[1].children[1].children[1]) {
                  docker.status =
                    child.children[0].children[1].children[1].children[1].contents;
                }
                if (child.children[1] && child.children[1].contents) {
                  docker.containerId = child.children[1].contents.replace(
                    'Container ID: ',
                    '',
                  );
                }
                break;
              case 'updatecolumn':
                if (child.children[2] && child.children[2].contents) {
                  docker.tag = child.children[2].contents.trim();
                }
                if (child.children[0] && child.children[0].contents) {
                  docker.uptoDate = child.children[0].contents.trim();
                }
                break;
            }
            if (docker.containerId) {
              containers[docker.containerId] = docker;
            }
          } else {
            switch (index) {
              case 0:
                docker.imageUrl =
                  child.children[0].children[0].children[0].tags.src;
                break;
              case 1:
                if (child && child.contents) {
                  docker.imageId = child.contents.replace('Image ID: ', '');
                }
                break;
              case 2:
                if (
                  child &&
                  child.contents &&
                  child.contents.includes('Created')
                ) {
                  docker.created = child.contents;
                }
                break;
            }
            if (docker.imageId) {
              images[docker.imageId] = docker;
            }
          }
        } catch (e) {
          console.log(
            'There was a problem retrieving a field for a docker image',
          );
          console.log(e.message);
        }
      });
    }
  });
  return { images, containers };
}
