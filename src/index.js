import server from "#configs/server";
import database from '#configs/database'



await database.sync({alter:true});
