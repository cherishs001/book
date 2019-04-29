export function SetCookie(n : string,v : string,e : number)
{
  const exdate=new Date();
  exdate.setDate(exdate.getDate()+e);
  document.cookie=n+ "=" +escape(v)+((e==null) ? "" : ";expires="+exdate.toUTCString());
}
export function GetCookie(n : string)
{
  if (document.cookie.length>0)
  {
    s=document.cookie.indexOf(n + "=");
    if (s!=-1)
    { 
      s=s + n.length+1;
      e=document.cookie.indexOf(";",s);
      if (e==-1) e=document.cookie.length;
      return unescape(document.cookie.substring(s,e));
    } 
  }
  return null
}
