export interface  IUser {
  _id: string;
  name: string;
  password: string;
  token: string;
  img:string;
  remember: boolean;
  tags: string[];
  likes: string[];
  followers: string[];
  followings: string[];
}
export class UserEntity implements IUser {
  followers: string[] = [];
  followings: string[] =[];
  img:string="";
  tags: string[] = [];
  likes: string[] = [];
  _id: any;
  name: string="";
  password: string="";
  token: string="";
  remember: boolean=false;

}