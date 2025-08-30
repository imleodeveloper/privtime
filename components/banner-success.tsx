export function BannerSuccess({
  show,
  hide,
  messageSuccess,
}: {
  show: boolean;
  hide: () => void;
  messageSuccess: string;
}) {
  return (
    <div className="fixed top-35 right-5 z-40 flex justify-center items-center">
      <div className="w-sm flex flex-col justify-center items-center gap-4 bg-green-800 border-3 border-green-400 p-4 rounded-lg">
        <div className="w-full flex justify-start items-center pb-2 border-b border-green-900">
          <span className="text-white font-bold">Sucesso!</span>
        </div>
        <div className="w-full flex justify-start items-start py-2 text-white">
          {messageSuccess}
        </div>
      </div>
    </div>
  );
}
