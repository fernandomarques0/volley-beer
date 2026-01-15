import React from 'react';

const Header = () => {
  return (
    <header>
      <h1>Volleyball Player Rating System</h1>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/vote">Vote</a></li>
          <li><a href="/rankings">Rankings</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;