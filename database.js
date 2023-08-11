import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

// Set up an event listener for the 'error' event
pool.on('error', (err) => {
    console.error('MySQL Pool Connection Error:', err);

    // Action here, such as logging the error or trying to reconnect
});

export async function getAllCredentials() {
    const query = 'SELECT * FROM user_credential';
    const [rows] = await pool.query(query);
    return rows;
}

export async function getUserbyId(id) {
    const query = 'SELECT * FROM user_credential WHERE uid = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
}

export async function getUser(uname){
    const query = 'SELECT * FROM user_credential WHERE u_name = ?';
    const [rows] = await pool.query(query, [uname]);
    return rows[0];
}

export async function createUser(uname, pwd, firstName, lastName){
  const query = "INSERT INTO user_credential (u_name, u_password, first_name, last_name) VALUES (?, ?, ?, ?)";
  const [result] = await pool.query(query, [uname, pwd, firstName, lastName]);
  const id = result.insertId;
  return getUserbyId(id);
};

export async function deleteUser(uname){
    const query = "DELETE FROM user_credential WHERE id = ?"
    await pool.query(query, [uname]);
    return uname;
};

export async function getUserStats(uid){
    const query = "Select * from health_stat where user_id = ?";
    const [rows] = await pool.query(query, [uid]);
    return rows;
}

export async function addUserStat(blood_pressure_low, blood_pressure_high, blood_glucose, user_id, date){
    const query = `INSERT INTO health_stat (blood_pressure_low, blood_pressure_high, 
                         blood_glucose, user_id, date) VALUES
                        (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(query, [blood_pressure_low, blood_pressure_high, blood_glucose, user_id, date]);
    return;
}


// const getAll = await getAllCredentials();
// console.log(getAll);
//
// const res = await createUser("test123@email.com", "test", "test1", "test1");
// console.log(res);

// const res = await getUser("test@gmail.com");
// if(res != undefined){
//     console.log("User found");
// } else{
//     console.log("No user found");
// }
// console.log(res);

