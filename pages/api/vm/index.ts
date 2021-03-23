import { requestChange } from 'lib/api/requestChange';
import { getCSRFToken } from 'lib/auth';
import { changeVMState } from 'lib/vm/changeVMState';

export default async function (req, res, next): Promise<void> {
  if (req.body) {
    const response = {
      message: await editVM(req.body),
      status: 200,
    };
    res.send(response);
  }
}

const defaultVM = {
  gpus: [
    {
      id: 'vnc',
      model: 'qxl',
      keymap: 'en-us',
    },
  ],
};

async function editVM(data) {
  const defaultVMObject: Record<string, any> = {
    edit: {
      ...defaultVM,
      // todo generate a mac
      domain_uuid: /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/,
    },
  };
  Object.keys(data.edit).forEach((key) => {
    defaultVMObject.edit[key] = data.edit[key];
  });

  const token = await getCSRFToken(data.server, data.auth);

  await changeVMState(data.id, 'domain-stop', data.server, data.auth, token);
  const result = await requestChange(
    data.server,
    data.id,
    data.auth,
    defaultVMObject.edit,
    // where is this meant to come from?
    true, // create,
  );
  await changeVMState(data.id, 'domain-start', data.server, data.auth, token);
  return result;
}
