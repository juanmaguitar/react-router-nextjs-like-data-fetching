import HttpStatus from './HttpStatus';
import React from 'react';

const NotFound = ()=> (
  <HttpStatus statusCode={404}>
    <div>
      <h1>404. Not Found.</h1>
    </div>
  </HttpStatus>
)

export default NotFound;
