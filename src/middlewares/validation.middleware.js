import httpStatus from '#utils/httpStatus'

export default function validation(schema){
  return function (req,res,next){
    try{
      const { error, value } = schema.validate(req);
      if(!error) return next()
      throw {
        status:false,
        message:error.details[0].message,
        httpStatus:httpStatus.BAD_REQUEST
      }
    }catch(error){
      next(error)
    }
  }
} 

