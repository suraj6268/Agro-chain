import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type = 'text', className = '', style = {} }) => {
  const typeClass = type === 'text' ? 'skeleton-text' : 
                   type === 'title' ? 'skeleton-title' : 
                   'skeleton-rect';
                   
  return <div className={`skeleton ${typeClass} ${className}`} style={style}></div>;
};

export default Skeleton;
