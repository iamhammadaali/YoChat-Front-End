import React , { useEffect, useRef, useState } from 'react';
import { Avatar, IconButton, TextField } from '@material-ui/core';
import { AttachFile, SearchOutlined,MoreVert, InsertEmoticon, Mic, Chat, DonutLarge, PersonAdd, NotInterested} from '@material-ui/icons';
import axios from 'axios';
import Autocomplete from '@material-ui/lab/Autocomplete';

import './home.css';
import BackgroundPic from '../assets/Register.png';

function Home({messages}) {

    const [input,setInput] = useState("");
    const [user,setUser] = useState({});
    const [selectedUser,setSelectedUser] = useState(null);
    const [allUsers,setAllUsers] = useState([]);
    const [allFriends,setFriends] = useState([]);
    const [chat,setChat] = useState([]);
    const divRef = useRef(null);

    useEffect(async ()=>{
        const username = localStorage.getItem('username');
        const res = await axios.post('http://localhost:5000/api/users/userdata',{
            username:username
        });
        const allUsers = await axios.get('http://localhost:5000/api/friends/allusers')
        console.log(allUsers);
        setAllUsers(allUsers.data);
        setUser(res.data);
        setFriends(res.data.friends);
        console.log(res.data);
    },[]);

    const sendMessage = async e => {
        e.preventDefault();

        await axios.post("/messages/new",{
            message:input,
            name:"Hammad Ali",
            timestamp:"Just now!",
            received:true
        });

        setInput('');
    }

    const onChange = (event,values)=>{
        console.log(values);
    }
 

    const checkUser = (username) =>{
        if(user && user.friends ){
            const foundUser = user.friends.filter(usr=>usr === username);
            console.log(foundUser);
            if(foundUser[0] === username){
                return true;
            }
            if(foundUser[0] !== username){
                return false;
            }
        }
    }

    const addFriendHandle = async (username)=>{
        console.log(username);
        const res = await axios.post('http://localhost:5000/api/friends/add',{
            username:localStorage.getItem('username'),
            friendHandle:username,
        });
        console.log(res);
        const getUserData = await axios.post('http://localhost:5000/api/users/userdata',{
            username: localStorage.getItem('username')
        });
        setFriends(getUserData.data.friends);
    }
  
    const handleSelectUser = async (username)=>{
        console.log("username",username);
        const res = await axios.post('http://localhost:5000/api/chats/getChat',{
            curUser:localStorage.getItem('username'),
            handle:username,
        });
        console.log(res);
        setSelectedUser(res.data);
        if(res.data !== null && res.data.success !==false){
            divRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }


    return (
    <div className="app">
      <div className="app_body">
        {user ? 
            <>
                <div className="sidebar">
                    <div className="sidebar_header"> 
                        <Avatar src="https://media-exp1.licdn.com/dms/image/C4D03AQETJkHu9f2njg/profile-displayphoto-shrink_800_800/0/1610014589603?e=1619654400&v=beta&t=5_hmMnIxU2bDi8i1P0rWiLvSPLIh6VssRw7vP0dXoeg" />
                        <div className="sidebar_headerRight">
                            <IconButton>
                                <DonutLarge></DonutLarge>
                            </IconButton>
                            <IconButton>
                                <Chat/>
                            </IconButton>
                            <IconButton>
                                <MoreVert/>
                            </IconButton>
                        </div>
                    </div>
                        <Autocomplete
                            id="combo-box-demo"
                            options={allUsers? allUsers:null}
                            getOptionLabel={(option) => option.username}
                            style={{ width: "100%"}}
                            onChange={onChange}
                            renderOption ={params=>{
                                console.log(params);
                                return(
                                <div className="row">
                                    <div className="col-6">
                                        {
                                            (!checkUser(params.username)) && params.username !== localStorage.getItem('username') ?
                                                <button className="btn addFriend" onClick={()=>addFriendHandle(params.username)}>
                                                    <PersonAdd/>
                                                </button>: null
                                        }   
                                    </div>
                                    <div className="col-6 mt-2">
                                        <p>{params.username}</p>
                                    </div>
                                </div>
                                )
                            }}
                            renderInput={(params) => (
                                <div className="sidebar_search p-4">
                                    <div className="sidebar_searchContainer" ref={params.InputProps.ref}>
                                            <SearchOutlined/>
                                            <input placeholder="Search or start new chat" type="text" {...params.inputProps}/>
                                    </div>
                                </div>
                            )}
                        />  
                    
                    <div className="sidebar_chats">
                        {
                            allFriends && allFriends.length >0 ?
                                <>
                                    {
                                        allFriends.map(friend=>(
                                            <div className="sidebarChat" key={friend} onClick={()=>handleSelectUser(friend)}>
                                                <Avatar/>
                                                <div className="sidebarChat_info">
                                                    <h2>{friend}</h2>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </>
                                : 
                                <div className="sidebarChat">
                                    <div className="sidebarChat_info">
                                        <span><PersonAdd/> Currently You have no friends. Search with username and add friends</span>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
                <div className="chat">
                    <div className="chat_header">
                        <Avatar/>
                        <div className="chat_headerInfo">
                            <h3>{`${user.firstName} ${user.lastName}`}</h3>
                        </div>
                        <div className="chat_headerRight">
                            <IconButton>
                                <SearchOutlined/>
                            </IconButton>
                            <IconButton>
                                <AttachFile/>
                            </IconButton>
                            <IconButton>
                                <MoreVert/>
                            </IconButton>
                        </div>
                    </div>
                    {console.log(selectedUser)}
                    {selectedUser !== null? 
                        <>
                        <div className="chat_body" style={{
                                backgroundImage: 'url("https://theabbie.github.io/blog/assets/official-whatsapp-background-image.jpg")'
                        }}>  
                            {selectedUser.msgs && selectedUser.msgs.map(cht=>(
                                <p className={`chat_message ${cht.from === localStorage.getItem('username') ? "chat_sender" : " chat_reciever"}`}>
                                <span className="chat_name">{cht.from}</span>
                                    {cht.msgText}
                                <span className="chat_timestamp">
                                    {cht.timestamp}
                                </span>
                                </p>
                            ))}
                            <div ref={divRef} />
                        </div>
                        <div className="chat_footer">
                            <InsertEmoticon/>
                            <form>
                                <input 
                                    value={input}
                                    onChange={e=>setInput(e.target.value)}
                                    placeholder="Type a message" type="text"/>
                                <button onClick={sendMessage} type="submit">Send a message</button>
                            </form>
                            <Mic/>
                        </div>
                        </> 
                    : <img src={BackgroundPic}  style={{width:"85%",height:"500px"}} />  }
                </div>
            </>
        : <p>Fetching Data.....</p>    
    }
    </div>
    </div>
    )
}

export default Home;