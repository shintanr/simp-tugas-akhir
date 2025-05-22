import { redirect } from 'next/navigation';

type ModulMap = {
  [key: number]: string;
};

const modulMap: ModulMap = {
  5: 'prak-sbd',
  6: 'prak-mulmed',
  7: 'prak-pjk',
  9: 'prak-eldas',
  12: 'prak-sdl',

};

const ModulIndexPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const id = Number(params.id);
  const folder = modulMap[id];

  if (folder) {
    redirect(`/praktikum/${id}/modul/${folder}`);
  }

  return <div>Modul tidak ditemukan untuk ID {id}</div>;
};

export default ModulIndexPage;
