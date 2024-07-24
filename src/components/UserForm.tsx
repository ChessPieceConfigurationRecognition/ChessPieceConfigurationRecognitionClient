import React, { useEffect, useState, useRef, RefObject, FormEvent } from 'react';
import ImagePopup from './ImagePopup';

interface UserFormProps {
    name: string | undefined,
	type: string | undefined,
    setTextareaContent: (content: string) => void,
    updateBoard: (fen: string, orientation: string) => void
}

interface Point {
    x: number,
    y: number,
    xPercent: number,
    yPercent: number
  }

const UserForm: React.FC<UserFormProps> = ({ name, type, setTextareaContent, updateBoard }) => {
    const fileInputRef: RefObject<HTMLInputElement> = useRef(null);
    const [selectedPlayer, setSelectedPlayer] = useState<string>('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [cropImage, setCropImage] = useState<boolean | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const imageWidth = 1280;
    const imageHeight = 720;

    const openModal = () => {
        const selectedFile = fileInputRef.current?.files?.[0];
        if (selectedFile) {
            setSelectedImage(URL.createObjectURL(selectedFile));
            setModalIsOpen(true);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!fileInputRef.current?.files || fileInputRef.current.files.length === 0) {
                    alert('File not uploaded!');
                    return;
                }
                if (selectedPlayer === '') {
                    alert('Player not selected!');
                    return;
                }
                if (cropImage === null) {
                    alert('Cropping option not selected!');
                    return;
                }
                const formData = new FormData();
                formData.append('image', fileInputRef.current.files[0]);
                const extraData = {
                    player: selectedPlayer,
                    corners: points,
                    name: name,
                    type: type
                };
                formData.append('extraData', JSON.stringify(extraData));
                setTextareaContent('Predicting...');
                const serverUrl = import.meta.env.VITE_SERVER_URL;
                const response = await fetch(`${serverUrl}/predict`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                setTextareaContent(data.message);
                updateBoard(data.message, selectedPlayer);
            } catch (error) {
                console.error(error);
            }
            
        };
        if (points.length === 4) {
            fetchData();
            setPoints([]);
        }
    }, [points]);

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement> | null) => {
        if (e !== null) {
            e.preventDefault();
        }
        if (!fileInputRef.current?.files || fileInputRef.current.files.length === 0) {
            alert('File not uploaded!');
            return;
        }
        if (selectedPlayer === '') {
            alert('Player not selected!');
            return;
        }
        if(cropImage === null) {
            alert('Cropping option not selected!');
            return;
        }
        if (cropImage === true) {
            openModal();
            return;
        }
        const formData = new FormData();
        formData.append('image', fileInputRef.current.files[0]);
        const extraData = {
            player: selectedPlayer,
            corners: null,
            name: name,
            type: type
        };
        formData.append('extraData', JSON.stringify(extraData));
        try {
            setTextareaContent('Predicting...');
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/predict`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setTextareaContent(data.message);
            updateBoard(data.message, selectedPlayer);
            
        } catch (error) {
            console.error(error);
        }
    };

    const handlePlayerSelect = (player: 'white' | 'black') => {
        setSelectedPlayer(player);
    };

    return (
        <form onSubmit={(event) => handleFormSubmit(event)}>
            <ImagePopup isOpen={modalIsOpen} closeModal={closeModal} image={selectedImage} width={imageWidth} height={imageHeight} updatePoints={setPoints} />
            <div className='mb-4'>
                <label htmlFor='fileInput' className='form-label'>Upload Image</label>
                <input id='fileInput' ref={fileInputRef} type='file' className='form-control' />
            </div>
            <div className='container mb-3'>
                <h3>Select player:</h3>
                <div className='form-check'>
                    <input
                        className='form-check-input'
                        type='radio'
                        id='whitePlayer'
                        value='white'
                        checked={selectedPlayer === 'white'}
                        onChange={() => handlePlayerSelect('white')}
                    />
                    <label className='form-check-label' htmlFor='whitePlayer'>
                        <span className={`checkmark ${selectedPlayer === 'white' ? 'selected' : ''}`}></span>
                        White
                    </label>
                </div>
                <div className='form-check'>
                    <input
                        className='form-check-input'
                        type='radio'
                        id='blackPlayer'
                        value='black'
                        checked={selectedPlayer === 'black'}
                        onChange={() => handlePlayerSelect('black')}
                    />
                    <label className='form-check-label' htmlFor='blackPlayer'>
                        <span className={`checkmark ${selectedPlayer === 'black' ? 'selected' : ''}`}></span>
                        Black
                    </label>
                </div>
            </div>
            <div className='container mb-4'>
                <h3>Crop image:</h3>
                <div className='form-check'>
                    <input
                        className='form-check-input'
                        type='radio'
                        id='cropYes'
                        value='yes'
                        checked={cropImage === true}
                        onChange={() => setCropImage(true)}
                    />
                    <label className='form-check-label' htmlFor='cropYes'>
                        Yes
                    </label>
                </div>
                <div className='form-check'>
                    <input
                        className='form-check-input'
                        type='radio'
                        id='cropNo'
                        value='no'
                        checked={cropImage === false}
                        onChange={() => setCropImage(false)}
                    />
                    <label className='form-check-label' htmlFor='cropNo'>
                        No
                    </label>
                </div>
            </div>
            <div>
                <button type='submit' className='btn btn-dark shadow-none'>Submit</button>
            </div>
        </form>
    );
};

export default UserForm;