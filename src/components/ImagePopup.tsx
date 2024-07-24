import React, { useState, useEffect, MouseEvent } from 'react';
import Modal from 'react-modal';

interface ImagePopupProps {
  isOpen: boolean;
  closeModal: () => void;
  image: string | null;
  height: number;
  width: number;
  updatePoints: (points: Point[]) => void;
}

interface Point {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
}

const ImagePopup: React.FC<ImagePopupProps> = ({ isOpen, closeModal, image, height, width, updatePoints }) => {
  const [points, setPoints] = useState<Point[]>([]);

  const handleImageClick = (event: MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    setPoints(prevPoints => {
      const newPoints = [...prevPoints, { x, y, xPercent, yPercent }];
      if (newPoints.length >= 4) {
        updatePoints(newPoints);
        closeModal();
      }
      return newPoints;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setPoints([]);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel='Image Modal'
      style={{
        overlay: {
          zIndex: 1000,
        },
        content: {
          zIndex: 1001,
          width: 'auto',
          height: 'auto',
        },
      }}
    >
      <div className='mb-3'>
        <div className='row'>
          <div className='col-2'>
            <button onClick={closeModal} className='btn btn-dark shadow-none w-100 mb-2'>Close</button>
          </div>
          <div className='col-8'></div>
        </div>
      </div>
      <div className='mb-3'>
        <p>Mark the corners of the chessboard in clockwise order starting from top-left.</p>
      </div>
      <div>
        <div className='text-center'>
          {image && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={image}
                style={{ width: `${width}px`, height: `${height}px` }}
                alt='Image'
                className='img-fluid'
                onClick={handleImageClick}
              />
              {points.map((point, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${point.x}px`,
                    top: `${point.y}px`,
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImagePopup;
