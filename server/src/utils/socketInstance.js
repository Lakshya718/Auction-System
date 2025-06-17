let ioInstance = null;

export const setIoInstance = (io) => {
  ioInstance = io;
};

export const getIoInstance = () => {
  if (!ioInstance) {
    throw new Error("Socket.io instance not set");
  }
  return ioInstance;
};
