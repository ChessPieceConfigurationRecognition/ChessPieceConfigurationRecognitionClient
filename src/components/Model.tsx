import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import BoardAnalyzer from './BoardAnalyzer';

interface ModelProps {
    name: string;
    type: string;
}

interface ImageData {
    [key: string]: string;
}

const Model: React.FC<ModelProps> = () => {
    const { name, type } = useParams<{ name: string, type: string }>();

    const [images, setImages] = useState<string[]>([]);
    useEffect(() => {
        const fetchTrainingData = async () => {
            try {
                const serverUrl = import.meta.env.VITE_SERVER_URL;
                const response = await fetch(`${serverUrl}/model_data?name=${name}&type=${type}`);
                if (response.ok) {
                    const data = await response.json();
                    const imagesData: ImageData = data.images || {};
                    const base64Images = Object.values(imagesData);
                    setImages(base64Images);
                } else {
                    console.error('Failed to fetch model data');
                }
            } catch (error) {
                console.error('Error fetching model data:', error);
            }
        };
    
        fetchTrainingData();
    }, [name, type]);

    return (
        <div className='container mt-4 mb-4'>
            <div className='card'>
                <div className='card-body'>
                    <div className='text-center mb-3'>
                            <Link to='/' className='btn btn-dark'>Back</Link>
                    </div>
                    <h1 className='text-center card-title'>[{type?.toUpperCase()}] Model: {name}</h1>
                    <div className='container'>
                        <BoardAnalyzer name={name} type={type}></BoardAnalyzer>
                    </div>
                    <div className='container mt-5'>
                        <h3 className='text-center mb-5'>Training results</h3>
                        {images.map((base64, index) => (
                            <div key={index} className='image-container'>
                                <img src={`data:image/png;base64,${base64}`} alt={`Image ${index}`} className='custom-img border border-dark rounded' />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Model;
