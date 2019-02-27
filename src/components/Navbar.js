import React from 'react';

const Navbar = props => (
    <div>
        <nav className="black">
            <div className="nav-wrapper">
                <a href="/" className="brand-logo">Inventory</a>
                <a href="/" data-target="snav" className="sidenav-trigger"><i className="material-icons">menu</i></a>
                <ul className="right hide-on-med-and-down">
                    <li><a href="/">Add</a></li>
                    <li><a href="/">Ship</a></li>
                    <li><a href="/">Log Out</a></li>
                </ul>
            </div>
        </nav>
        <ul className="sidenav" id="snav">
            <li><a href="/">Add</a></li>
            <li><a href="/">Ship</a></li>
            <li><a href="/">Log Out</a></li>
        </ul>
    </div>
)

export default Navbar;