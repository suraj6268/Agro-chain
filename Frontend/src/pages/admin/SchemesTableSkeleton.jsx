import React from 'react';
import Skeleton from '../../components/Skeleton';
import './SchemesManagement.css';

const SchemesTableSkeleton = () => {
    return (
        <div className="schemes-table">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Ministry</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <tr key={i}>
                            <td className="scheme-name-cell">
                                <Skeleton type="text" style={{ width: '150px', height: '16px', marginBottom: '4px' }} />
                                <Skeleton type="text" style={{ width: '200px', height: '12px' }} />
                            </td>
                            <td>
                                <Skeleton type="text" style={{ width: '80px', height: '24px', borderRadius: '20px' }} />
                            </td>
                            <td className="ministry-cell">
                                <Skeleton type="text" style={{ width: '100px', height: '14px' }} />
                            </td>
                            <td>
                                <Skeleton type="text" style={{ width: '60px', height: '20px', borderRadius: '12px' }} />
                            </td>
                            <td>
                                <Skeleton type="text" style={{ width: '30px', height: '14px' }} />
                            </td>
                            <td className="actions-cell">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Skeleton type="rect" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                                    <Skeleton type="rect" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                                    <Skeleton type="rect" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SchemesTableSkeleton;
