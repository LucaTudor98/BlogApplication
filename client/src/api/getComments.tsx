import React, { useState } from 'react'
import { Button } from "react-bootstrap";


const axios = require('axios').default;
export const PostsApi = () => {
    const [data, setData] = useState([]);
    const onGetData=()=>{
      axios.get('http://localhost:8000/api/posts')
      .then((resp: { data: any; }) => {
        setData((resp.data[0].title));      
         
        
      })
      .catch((err: any) => {
          // Handle Error Here
          console.error(err);
      });
      
    }
  
    return (
      <div>        
        <Button onClick ={onGetData}>getData</Button>
        <p>First post Title: {data}</p>
      </div>
    );
  };
  