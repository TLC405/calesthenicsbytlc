/** An installed app starts at Home; browser deep links retain their destination. */
export function shouldLaunchHome(standalone:boolean,pathname:string,firstDocumentVisit:boolean){return standalone&&firstDocumentVisit&&pathname!=='/'&&!['/admin-login','/auth'].includes(pathname);}
