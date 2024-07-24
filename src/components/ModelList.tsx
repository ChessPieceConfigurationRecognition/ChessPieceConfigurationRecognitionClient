import React from 'react';
import { Link } from 'react-router-dom';

interface ModelListProps {
    modelList: { name: string, type: string }[];
}

const ModelList: React.FC<ModelListProps> = ({ modelList }) => {
    return (
        <div className='container mt-4 mb-4'>
            <div className='card'>
                <div className='card-body'>
                    <h2 className='card-title'>Trained models</h2>
                    <div className='mt-4 mb-2 list-group'>
                        {modelList.map((model, index) => (
                            <Link key={index} to={`/${model.type}/${model.name}`} className='list-group-item list-group-item-action list-group-item-dark'>
                                [{model.type.toUpperCase()}] {model.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelList;
