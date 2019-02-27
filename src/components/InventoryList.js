import React from 'react';

const InventoryList = props => {
    return (
        <div className="row">
            <table className="highlight bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {props.data ? props.data.map((part, index) => {
                        return (
                            <tr key={index}>
                                <td>{part.name}</td>
                                <td>{part.qty}</td>
                            </tr>
                        )
                    }) : null}
                </tbody>
            </table>
        </div>
    )
}

export default InventoryList;