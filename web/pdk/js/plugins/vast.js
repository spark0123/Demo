$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTParser=$pdk.extend(function(){},{constructor:function(){if($pdk.plugin.vast.VASTParser._instance){this.parse=null;
this.parseVast=null;
throw"$pdk.plugin.vast.VASTParser is a Singlton. Access via getInstance()"
}$pdk.plugin.vast.VASTParser._instance=this;
tpDebug("VASTParser instantiated.","","VAST")
},parse:function(b){var c;
var a;
if(b instanceof window.Document){tpRemoveWhiteSpace(b);
c=b;
a=this.parseVast(c.childNodes[0].childNodes);
if(a&&c.childNodes[0].attributes.version){a.version=c.childNodes[0].attributes.version.nodeValue
}}else{if(b.xml){c=tpParseXml(b.xml);
a=this.parseVast(c.childNodes[0].childNodes);
if(a&&c.childNodes[0].attributes.version){a.version=c.childNodes[0].attributes.version.nodeValue
}}else{if(b instanceof Element){a=this.parseVast(b.childNodes);
if(a&&b.attributes.version){a.version=b.attributes.version.nodeValue
}}else{c=tpParseXml(b);
a=this.parseVast(c.childNodes[0].childNodes);
if(c.childNodes[0].attributes.version){a.version=c.childNodes[0].attributes.version.nodeValue
}}}}return a
},parseVast:function(b){var a={};
var d;
a.ads=[];
for(var c=0;
c<b.length;
c++){if(b[c] instanceof Element){d=this.parseAd(b[c]);
if(d){a.ads.push(d)
}}}if(a.ads.length>0){return a
}else{return null
}},parseAd:function(b){var g=b.childNodes[0];
var a;
if(!(g instanceof Element)){return null
}if(g.tagName=="InLine"){a=this.parseInLine(g);
if(b.attributes.sequence&&a){a.sequence=parseInt(b.attributes.sequence.nodeValue,10)
}if(!a){return null
}a.adType="InLine";
return a
}else{if(g.tagName=="Wrapper"){a={};
a.id=b.attributes.getNamedItem("id").nodeValue;
if(b.attributes.sequence){a.sequence=parseInt(b.attributes.sequence.nodeValue,10)
}var j=g.getElementsByTagName("AdSystem")[0];
if(j){a.adSystem=j.childNodes.nodeValue
}a.error=this.parseSimpleUrl(g.getElementsByTagName("Error")[0]);
a.extensions=g.getElementsByTagName("Extensions")[0];
try{a.impressions=this.parseImpressions(g.getElementsByTagName("Impression"))
}catch(f){console.error(f)
}a.trackingEvents=this.parseTrackingEvents(g.getElementsByTagName("TrackingEvents")[0]);
a.adType="Wrapper";
a.vastAdData={};
a.vastAdData.ads=[];
var h=b.getElementsByTagName("VASTAdData");
if(!h.length){h=b.getElementsByTagName("vastaddata")
}var d=h[0].childNodes;
for(var c=0;
c<d.length;
c++){if(d[c] instanceof Element){ad=this.parseAd(d[c]);
if(ad){a.vastAdData.ads.push(ad)
}}}return this.parseWrapper(g,a)
}else{throw new Error("Unrecognized ad type: "+g.tagName)
}}return null
},parseUrls:function(a){if(a&&a.childNodes){var c=[];
for(var b=0;
b<a.childNodes.length;
b++){c.push(this.parseUrl(a.childNodes[b]))
}return c
}return null
},parseUrl:function(b){var a={};
a.url=this.parseSimpleUrl(b);
if(b.attributes&&b.attributes.id){a.id=b.attributes.id.nodeValue
}else{a.id=null
}return a
},parseSimpleUrl:function(a){if(a&&a.nodeValue){return a.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].nodeValue){return a.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].textContent){return a.childNodes[0].textContent.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{return null
}}}},parseImpressions:function(d){if(!d){return null
}var b=[];
var a=d.length;
var c=0;
for(;
c<a;
c++){b=b.concat(this.parseUrls(d[c]))
}return b
},parseTrackingEvents:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseTrackingEvent(b.childNodes[c]))
}return a
}return null
},parseTrackingEvent:function(b){var a={};
if(b.attributes.event){a.event=b.attributes.event.nodeValue
}a.urls=this.parseUrls(b);
return a
},parseWrapper:function(b,d){var a=d?d:{};
a.vastAdTagURL=this.parseSimpleUrl(b.getElementsByTagName("VASTAdTagURI")[0]);
a.videoClicks=this.parseVideoClicks(b.getElementsByTagName("VideoClicks")[0]);
var e=b.getElementsByTagName("vastaddata")[0];
if(e){for(var c=0;
c<e.childNodes.length;
c++){}}return a
},parseInLine:function(b){var c={};
if(b.attributes.id){c.id=b.attributes.id.nodeValue
}try{c.adSystem=b.getElementsByTagName("AdSystem")[0].childNodes[0].nodeValue
}catch(e){tpDebug("AdSystem child node not present on Inline VAST Ad. Per the VAST spec, it is required.","","VAST",tpConsts.ERROR);
return null
}c.error=this.parseSimpleUrl(b.getElementsByTagName("Error")[0]);
c.extensions=b.getElementsByTagName("Extensions")[0];
try{c.impressions=this.parseImpressions(b.getElementsByTagName("Impression"))
}catch(d){tpDebug(d,"","VAST",tpConsts.ERROR)
}var a=this.parseCreatives(b,c);
return a
},parseCreatives:function(e,h){var j=h;
if(e.getElementsByTagName("AdTitle")[0]&&e.getElementsByTagName("AdTitle")[0].childNodes[0]){j.adTitle=e.getElementsByTagName("AdTitle")[0].childNodes[0].nodeValue
}if(e.getElementsByTagName("Description")[0]&&e.getElementsByTagName("Description")[0].childNodes[0]){j.description=e.getElementsByTagName("Description")[0].childNodes[0].nodeValue
}var g=e.getElementsByTagName("Creatives")[0];
if(!g){return null
}for(var c=0;
c<g.childNodes.length;
c++){var f=g.childNodes[c];
if(f.getElementsByTagName("CompanionAds").length>0){var a=f.getElementsByTagName("CompanionAds")[0];
if(a){j.companionAds=this.parseCompanionAds(a)
}}if(f.getElementsByTagName("Linear")[0]){var d=f.getElementsByTagName("Linear")[0];
if(d){j.video=this.parseVideo(d)
}}if(f.getElementsByTagName("NonLinearAds").length>0){var b=f.getElementsByTagName("NonLinearAds")[0];
if(b){j.nonLinearAds=this.parseNonLinearAds(b)
}}}if(!j.video){j.video={}
}return j
},parseCompanionAds:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseCompanion(b.childNodes[c]))
}return a
}return null
},parseCompanion:function(b){var a={};
if(b.getElementsByTagName("AltText")[0]&&b.getElementsByTagName("AltText")[0].childNodes[0]){a.altText=b.getElementsByTagName("AltText")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("adParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("Code")[0]&&b.getElementsByTagName("Code")[0].childNodes[0]){a.code=b.getElementsByTagName("Code")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("CompanionClickThrough")[0]){a.companionClickThrough=this.parseSimpleUrl(b.getElementsByTagName("CompanionClickThrough")[0])
}if(b.attributes.creativeType){a.creativeType=b.attributes.creativeType.nodeValue
}if(b.attributes.expandedHeight){a.expandedHeight=b.attributes.expandedHeight.nodeValue
}if(b.attributes.expandedWidth){a.expandedWidth=b.attributes.expandedWidth.nodeValue
}if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.resourceType){a.resourceType=b.attributes.resourceType.nodeValue
}if(b.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(b.getElementsByTagName("StaticResource")[0])
}if(b.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(b.getElementsByTagName("IFrameResource")[0])
}if(b.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=b.getElementsByTagName("HTMLResource")[0]
}if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseVideo:function(b){var a={};
if(b.getElementsByTagName("Duration")[0]){a.duration=tpTimeToMillis(b.getElementsByTagName("Duration")[0].childNodes[0].nodeValue)
}if(b.getElementsByTagName("AdID")[0]){a.adId=b.getElementsByTagName("AdID")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("AdParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("VideoClicks")[0]){a.videoClicks=this.parseVideoClicks(b.getElementsByTagName("VideoClicks")[0])
}if(b.getElementsByTagName("MediaFiles")[0]){a.mediaFiles=this.parseMediaFiles(b.getElementsByTagName("MediaFiles")[0])
}if(b.getElementsByTagName("TrackingEvents")[0]){a.trackingEvents=this.parseTrackingEvents(b.getElementsByTagName("TrackingEvents")[0])
}if(b.attributes.skipoffset){var d=b.attributes.skipoffset.nodeValue;
if(d.indexOf(":")>0){var c=d.split(":");
a.skipOffset=(c[0]*60*60)+(c[1]*60)+(c[2])
}else{if(d.indexOf("%")>0){if(a.duration){a.skipOffset=Math.round((a.duration/1000)*(parseInt(d,10)*0.01))
}}else{a.skipOffset=parseInt(d,10)
}}}return a
},parseAdParameters:function(b){if(b){try{var a={};
a.apiFramework=b.attributes.apiFramework;
a.parameters=b.childNodes[0].nodeValue;
return a
}catch(c){}}return null
},parseVideoClicks:function(b){if(b){var a={};
a.clickThrough=this.parseUrls(b.getElementsByTagName("ClickThrough")[0]);
a.clickTracking=this.parseUrls(b.getElementsByTagName("ClickTracking")[0]);
if(b.getElementsByTagName("CustomClick").length>0){a.customClick=this.parseUrls(b.getElementsByTagName("CustomClick")[0])
}return a
}return null
},parseMediaFiles:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseMediaFile(b.childNodes[c]))
}return a
}return null
},parseMediaFile:function(b){var a={};
if(b.attributes.bitrate){a.bitrate=b.attributes.bitrate.nodeValue*1000
}a.delivery=(b.attributes.delivery?b.attributes.delivery.nodeValue:null);
if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.type){a.type=b.attributes.type.nodeValue
}a.url=this.parseSimpleUrl(b);
if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseNonLinearAds:function(c){if(c&&c.childNodes){var b;
if(c.getElementsByTagName("TrackingEvents")){b=this.parseTrackingEvents(c.getElementsByTagName("TrackingEvents")[0])
}var a=[];
var e=c.getElementsByTagName("NonLinear");
for(var d=0;
d<e.length;
d++){a.push(this.parseNonLinear(e[d],b));
b=null
}return a
}return null
},parseNonLinear:function(c,b){var a={};
if(c.attributes.apiFramework){a.apiFramework=c.attributes.apiFramework.nodeValue
}if(c.attributes.expandedHeight){a.expandedHeight=c.attributes.expandedHeight.nodeValue
}if(c.attributes.expandedWidth){a.expandedWidth=c.attributes.expandedWidth.nodeValue
}if(c.attributes.height){a.height=c.attributes.height.nodeValue
}if(c.attributes.id){a.id=c.attributes.id.nodeValue
}if(c.attributes.maintainAspectRatio){a.maintainAspectRatio=c.attributes.maintainAspectRatio.nodeValue
}a.nonLinearClickThrough=this.parseSimpleUrl(c.getElementsByTagName("NonLinearClickThrough")[0]);
a.adParameters=this.parseAdParameters(c.getElementsByTagName("AdParameters")[0]);
if(c.attributes.resourceType){a.resourceType=c.attributes.resourceType.nodeValue
}if(c.attributes.scalable){a.scalable=c.attributes.scalable.nodeValue
}if(c.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(c.getElementsByTagName("StaticResource")[0])
}if(c.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(c.getElementsByTagName("IFrameResource")[0])
}if(c.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=c.getElementsByTagName("HTMLResource")[0]
}if(c.attributes.width){a.width=c.attributes.width.nodeValue
}if(b){a.trackingEvents=b
}return a
}});
$pdk.plugin.vast.VASTParser.getInstance=function(){if(!$pdk.plugin.vast.VASTParser._instance){$pdk.plugin.vast.VASTParser._instance=new $pdk.plugin.vast.VASTParser()
}return $pdk.plugin.vast.VASTParser._instance
};
$pdk.plugin.vast.VASTParser.getInstance();
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VMAPParser=$pdk.extend(function(){},{constructor:function(){if($pdk.plugin.vast.VMAPParser._instance){this.parse=null;
this.parseVmap=null;
throw"$pdk.plugin.vast.VMAPParser is a Singlton. Access via getInstance()"
}$pdk.plugin.vast.VMAPParser._instance=this;
tpDebug("VMAPParser instantiated.","","VMAP")
},parse:function(a,d){this.vastResponseIndex=0;
this.vastResponses={};
var e;
if(a instanceof window.Document){tpRemoveWhiteSpace(a);
e=a
}else{if(a.xml){e=tpParseXml(a.xml)
}else{e=tpParseXml(a)
}}tpRemoveComments(e);
if(e&&e.childNodes&&e.childNodes.length>0){var c=0;
for(var b=0;
b<e.childNodes.length;
b++){if(e.childNodes[b].localName.toLowerCase()=="vmap"){c=b;
break
}}return this.parseVmap(e.childNodes[c].childNodes,d)
}else{return null
}},parseVmap:function(b,e){var a={};
var d;
a.adbreaks=[];
for(var c=0;
c<b.length;
c++){if(b[c] instanceof Element){d=this.parseAdBreak(b[c],e);
if(d&&d.adTagUri){a.adbreaks.push(d)
}}}if(a.adbreaks.length>0){return a
}else{return null
}},parseUrls:function(a){if(a&&a.childNodes){var c=[];
for(var b=0;
b<a.childNodes.length;
b++){c.push(this.parseUrl(a.childNodes[b]))
}return c
}return null
},parseOffset:function(g,f){if(g=="start"||g=="end"){return g
}if(g.indexOf(":")>=0){var d=0,a=0,c=0,b=0;
var e=g.split(":");
while(e.length){if(e.length==1){c=parseInt(e[0].split(".")[0],10);
if(e[0].indexOf(".")>=0){b=parseInt(e[0].split(".")[1],10)
}}else{if(e.length==2){a=parseInt(e[0],10)
}else{if(e.length==3){d=parseInt(e[0],10)
}}}e.shift()
}return d*3600000+a*60000+c*1000+b
}else{if(g.indexOf("%")>=0){return f*parseInt(g.replace("%",""),10)/100
}else{if(g.indexOf("#")>=0){return g
}}}},parseUrl:function(b){var a={};
a.url=this.parseSimpleUrl(b);
if(b.attributes&&b.attributes.id){a.id=b.attributes.id.nodeValue
}else{a.id=null
}return a
},parseSimpleUrl:function(a){if(a&&a.nodeValue){return a.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].nodeValue){return a.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].textContent){return a.childNodes[0].textContent.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{return null
}}}},parseAdBreak:function(c,g){var f;
var a;
a={};
if(c.attributes.timeOffset){a.timeOffset=this.parseOffset(c.attributes.timeOffset.value,g)
}if(c.attributes.breakType){a.breakType=c.attributes.breakType.value
}if(c.attributes.breakId){a.breakId=c.attributes.breakId.value
}for(var b=0;
b<c.childNodes.length;
b++){f=c.childNodes[b];
if(!(f instanceof Element)){continue
}if(f.localName=="AdSource"){if(f.attributes.allowMultipleAds){a.allowMultipleAds=(f.attributes.allowMultipleAds.value==="false"?false:true)
}if(f.attributes.followRedirects){a.followRedirects=(f.attributes.followRedirects.value==="false"?false:true)
}if(f.childNodes){var e;
for(var d=0;
d<f.childNodes.length;
d++){e=f.childNodes[d];
if(e.localName.toLowerCase()=="adtaguri"){a.adTagUri=this.parseSimpleUrl(f.childNodes[0])
}else{if(e.localName.toLowerCase()=="vastaddata"){this.vastResponseIndex++;
a.vastAdData=e.childNodes[0];
a.adTagUri="vmap-parser:vast-response-"+this.vastResponseIndex;
this.vastResponses[a.adTagUri]=a.vastAdData
}else{if(e.localName.toLowerCase()=="customaddata"){tpDebug("AdSource source is CustomAdData, which is not handled yet.","","VAST",tpConsts.WARN);
return null
}else{tpDebug("AdSource source is not one of allowed values (VastAdData, AdTagURI, or CustomAdData). It is '"+e.localName+"'. Skipping this AdBreak.","","VAST",tpConsts.ERROR);
return null
}}}}}}else{if(f.localName=="TrackingEvents"){}else{if(f.localName=="Extensions"){}else{tpDebug("Unrecognized AdBreak type: "+f.localName,"","VAST",tpConsts.ERROR);
return null
}}}}return a
},getVASTResponse:function(a){return this.vastResponses[a]
},parseImpressions:function(d){if(!d){return null
}var b=[];
var a=d.length;
var c=0;
for(;
c<a;
c++){b=b.concat(this.parseUrls(d[c]))
}return b
},parseTrackingEvents:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseTrackingEvent(b.childNodes[c]))
}return a
}return null
},parseTrackingEvent:function(b){var a={};
if(b.attributes.event){a.event=b.attributes.event.nodeValue
}a.urls=this.parseUrls(b);
return a
},parseCompanionAds:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseCompanion(b.childNodes[c]))
}return a
}return null
},parseCompanion:function(b){var a={};
if(b.getElementsByTagName("AltText")[0]&&b.getElementsByTagName("AltText")[0].childNodes[0]){a.altText=b.getElementsByTagName("AltText")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("adParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("Code")[0]&&b.getElementsByTagName("Code")[0].childNodes[0]){a.code=b.getElementsByTagName("Code")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("CompanionClickThrough")[0]){a.companionClickThrough=this.parseSimpleUrl(b.getElementsByTagName("CompanionClickThrough")[0])
}if(b.attributes.creativeType){a.creativeType=b.attributes.creativeType.nodeValue
}if(b.attributes.expandedHeight){a.expandedHeight=b.attributes.expandedHeight.nodeValue
}if(b.attributes.expandedWidth){a.expandedWidth=b.attributes.expandedWidth.nodeValue
}if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.resourceType){a.resourceType=b.attributes.resourceType.nodeValue
}if(b.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(b.getElementsByTagName("StaticResource")[0])
}if(b.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(b.getElementsByTagName("IFrameResource")[0])
}if(b.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=b.getElementsByTagName("HTMLResource")[0]
}if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseVideoClicks:function(b){if(b){var a={};
a.clickThrough=this.parseUrls(b.getElementsByTagName("ClickThrough")[0]);
a.clickTracking=this.parseUrls(b.getElementsByTagName("ClickTracking")[0]);
if(b.getElementsByTagName("CustomClick").length>0){a.customClick=this.parseUrls(b.getElementsByTagName("CustomClick")[0])
}return a
}return null
}});
$pdk.plugin.vast.VMAPParser.getInstance=function(){if(!$pdk.plugin.vast.VMAPParser._instance){$pdk.plugin.vast.VMAPParser._instance=new $pdk.plugin.vast.VMAPParser()
}return $pdk.plugin.vast.VMAPParser._instance
};
$pdk.plugin.vast.VMAPParser.getInstance();
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.PlaylistProcessor=$pdk.extend(function(){},{constructor:function(a){this._scopes=a;
tpDebug("PlaylistProcessor instantiated.","","VMAP")
},splice:function(){if(arguments.length<3){return
}var f=arguments[0];
var a=arguments[1];
var d=arguments[2];
var e=[];
var c;
if(d>0){console.error("Warning PlaylistProcessor.splice does not support removing")
}if(arguments.length>3){for(var b=arguments.length-1;
b>=3;
b--){c=arguments[b];
this._insertClipAtIndex(f,c,a)
}}return e
},createClip:function(d,h,f,c,a,b){if(arguments.length==5){a=c
}var g={};
g.id=""+Math.floor(Math.random()*100000);
g.isAd=c;
g.noSkip=a;
g.streamType="flashVideoUnknownMP4";
g.URL=d;
g.description=f;
g.type=b;
g.globalDataType="com.theplatform.pdk.data::BaseClip";
var e=com.theplatform.pdk.SelectorExported.getInstance(this._scopes.toString()).parseClip(g);
e.baseClip=g;
return e
},_insertClipAtIndex:function(d,c,a){d.chapters.chapters=[];
if(a<d.clips.length&&d.clips[a].chapter.adIndex==-1){d.clips[a].chapter.adIndex=d.clips[a].chapter.contentIndex
}for(var b=0;
b<d.clips.length;
b++){if(d.clips[b].chapter){d.chapters.chapters.push(d.clips[b].chapter)
}if(b>=a){if(d.clips[b].chapter){d.clips[b].chapter.contentIndex++
}d.clips[b].clipIndex++;
if(b>a&&d.clips[b].chapter&&d.clips[b].chapter.adIndex>=0){d.clips[b].chapter.adIndex++
}}}c.clipIndex=a;
d.baseClips.splice(a,0,c.baseClip);
d.clips.splice(a,0,c)
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTProcessor=$pdk.extend(function(){},{constructor:function(a,b,c,d){this.controller=a;
this._enablePods=b;
this._defaultEnablePods=b;
this.mimeTypes=c;
this.adTracking=new $pdk.plugin.vast.AdTracking();
this.allowClicks=d
},initialize:function(){this.parentWrappers=[];
this._enablePods=this._defaultEnablePods
},success:function(){this.vastSuccess(this._playlist)
},process:function(c,b,a){if(!c||!c.ads||c.ads.length===0){tpDebug("No ads found",this.controller.id,"VAST");
a();
return
}if(parseFloat(c.version)>=3){this._enablePods=true
}this.vastError=a;
this.vastSuccess=b;
this._playlist={};
this._playlist.baseClips=[];
this._playlist.clips=[];
this._playlist.globalDataType="com.theplatform.pdk.data::Playlist";
this.processVAST(c)
},processVAST:function(b){var j=0;
var k=0;
var h=0;
for(var f=0;
f<b.ads.length;
f++){var l=b.ads[f];
if(l.sequence&&!isNaN(l.sequence)){h++
}if(l.adType==="Wrapper"){j++
}else{if(l.adType==="InLine"){k++
}else{tpDebug("Unknown ad type: "+(l?l.adType:"<null>")+" ignoring",this.controller.id,"VAST")
}}}tpDebug("VAST playlist with "+k+" inline and "+j+" wrapper Ads.",this.controller.id,"VAST");
if(this._enablePods&&(h>0)){tpDebug("Detected VAST 3.0 sequence attributes",this.controller.id,"VAST");
var e=[];
var c=[];
for(f=0;
f<b.ads.length;
f++){if(b.ads[f].sequence&&!isNaN(b.ads[f].sequence)){c.push(b.ads[f])
}}while(c.length>0){var g=Number.MAX_VALUE;
var a=-1;
var d=0;
for(f=0;
f<c.length;
f++){d=Number(b.ads[f].sequence);
if(d<g){g=d;
a=f
}}e.push(c[a]);
c.splice(a,1)
}this.ads=e;
this.processAd();
for(f=0;
f<e.length;
f++){this.processAd(e[f])
}this.doneWithVAST();
return
}else{if(j>0||k>0){tpDebug("Detected VAST 2.0 inline",this.controller.id,"VAST");
if(this._enablePods){if(b.ads.length>1){tpDebug("Playing only first ad, since VAST 3.0 was triggered and there are no sequences",this.controller.id,"VAST")
}this.processAd(b.ads[0])
}else{tpDebug("Playing all ads, since VAST 2.0 was triggered (2.0 pod simulation)",this.controller.id,"VAST");
for(f=0;
f<b.ads.length;
f++){this.processAd(b.ads[f])
}}this.doneWithVAST();
return
}}if(this._playlist.clips.length>0){this.doneWithVAST()
}else{if(this.parentWrappers.length===0){this.vastError()
}}},doneWithVAST:function(){if(this.parentWrappers.length===0){this.success()
}},processCompanions:function(g,h){if(!(g&&g.length)){return
}if(!h.banners){h.banners=[]
}tpDebug("adding companions",this.controller.id,"VAST");
var n,a,b,k,j,c,o,m,l,f,d;
for(var e=0;
e<g.length;
e++){if(g[e].staticResource){if(g[e].staticResource){a=g[e].staticResource
}else{if(ads[e].iFrameResource){a=g[e].iFrameResource
}}b=g[e].companionClickThrough;
j="_blank";
c=parseInt(g[e].width,10);
o=parseInt(g[e].height,10);
if(g[e].creativeType){d=g[e].creativeType
}if(g[e].altText){f=g[e].altText
}m=g[e].id;
l=g[e].id;
n={globalDataType:"com.theplatform.pdk.data::Banner",guid:l,region:m,src:a,href:b,target:j,alt:f,bannerType:d,bannerWidth:c,bannerHeight:o,bannerSize:(c*o)};
h.banners.push(n)
}}},processOverlays:function(b,f){if(!(b&&b.length)){return
}if(!f.overlays){f.overlays=[]
}tpDebug("adding overlays",this.controller.id,"VAST");
var l,a,c,h,g,d,m,k,j;
for(var e=0;
e<b.length;
e++){if(b[e]){if(b[e].staticResource){a=b[e].staticResource
}else{if(ads[e].iFrameResource){a=b[e].iFrameResource
}else{continue
}}c=b[e].nonLinearClickThrough;
g="_blank";
d=b[e].width;
m=b[e].height;
if(b[e].id){j=b[e].id
}else{j="tpVASTOverlay"
}j+="_"+Math.floor(Math.random()*100000);
overlay={globalDataType:"com.theplatform.pdk.data::Overlay",src:a,href:c,target:g,bannerWidth:(d*1),bannerHeight:(m*1),bannerSize:(d*m),guid:j};
this.processTrackingEvents(b[e].trackingEvents,overlay);
f.overlays.push(overlay)
}}},processTrackingEvents:function(f,e){if(f){var a=f.length;
i=0;
for(;
i<a;
i++){var g=f[i];
if(g.event=="creativeView"){if(g.urls){if(!e.impressionUrls){e.impressionUrls=[]
}var b=g.urls.length;
var d=0;
for(;
d<b;
d++){var c=g.urls[d];
e.impressionUrls.push(c.url)
}}}}}},processImpressions:function(c,b){if(b&&c&&c.length){if(!b.impressionUrls){b.impressionUrls=[]
}for(var a=0;
a<c.length;
a++){if(c[a].url){b.impressionUrls.push(c[a].url)
}}}},processMediaTrackingEvents:function(f,g){tpDebug("adding Tracking URLs",this.controller.id,"VAST");
if(!(f.trackingEvents&&f.trackingEvents.length)){return
}if(!g.trackingURLs){g.trackingURLs=[]
}for(var e=0;
e<f.trackingEvents.length;
e++){if(f.trackingEvents[e].event=="creativeView"){if(f.trackingEvents[e].urls){if(!g.impressionUrls){g.impressionUrls=[]
}var b=f.trackingEvents[e].urls.length;
var d=0;
for(;
d<b;
d++){var c=f.trackingEvents[e].urls[d];
if(c){g.impressionUrls.push(c.url)
}}}}var a=this.adTracking.getTrackingUrl(f.trackingEvents[e]);
if(a){g.trackingURLs.push(a)
}else{tpDebug("TrackingEvent "+f.trackingEvents[e].event+" not supported. Ignoring.",this.controller.id,"VAST")
}}},processVideoClicks:function(d,e){var c=d.videoClicks;
if(c){if(!e.moreInfo){e.moreInfo={globalDataType:"com.theplatform.pdk.data::HyperLink"};
e.moreInfo.clickTrackingUrls=[]
}if(this.allowClicks&&c.clickThrough&&c.clickThrough.length>0){e.moreInfo.href=c.clickThrough[0].url
}else{e.moreInfo.href=null
}if(this.allowClicks&&c.clickTracking){var b=0;
var a=c.clickTracking.length;
for(;
b<a;
b++){e.moreInfo.clickTrackingUrls.push(c.clickTracking[b].url)
}}}},_playlist:null,processMediaFiles:function(d,l,a,o){var p=null;
var m={};
var h,g;
var c;
for(h=0;
h<this.parentWrappers.length;
h++){c=this.parentWrappers[h];
this.processMediaTrackingEvents(c,m);
this.processVideoClicks(c,m);
this.processImpressions(c.impressions,m)
}if(d&&d.mediaFiles&&d.mediaFiles.length){m.releaseLength=d.duration;
if(d.mediaFiles&&d.mediaFiles.length){tpDebug("looping through MediaFiles");
var f=true;
var k;
if(this.mimeTypes&&this.mimeTypes.length){for(h=0;
h<this.mimeTypes.length;
h++){for(g=0;
g<d.mediaFiles.length;
g++){k=d.mediaFiles[g];
if(k&&this.isAllowedVideo(k)&&k.type==this.mimeTypes[h]){this.addVideoToBaseClip(k,m,f);
tpDebug("mediaFile["+g+"]: "+k.url);
f=false
}}}}else{for(h=0;
h<d.mediaFiles.length;
h++){k=d.mediaFiles[h];
if(k&&this.isAllowedVideo(k)){this.addVideoToBaseClip(k,m,f);
tpDebug("mediaFile["+g+"]: "+k.url);
f=false
}}}}}if(m.URL){if(d.adParameters){if(typeof d.adParameters.parameters!="string"){m.trackingData=JSON.stringify(d.adParameters.parameters).replace(/\\n/g,"\n").replace(/\\"/g,'"')
}else{m.trackingData=d.adParameters.parameters
}}this.processImpressions(o,m);
this.processMediaTrackingEvents(d,m);
this.processVideoClicks(d,m);
this.processCompanions(l,m);
this.processOverlays(a,m);
var e=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(m);
e.baseClip=m;
e.length=m.releaseLength;
this._playlist.clips.push(e);
this._playlist.baseClips.push(m);
if(m.type==="application/x-shockwave-flash"){e.isExternal=true
}if(d.skipOffset){e.skipOffset=1000*Number(d.skipOffset)
}e.chapter={globalDataType:this.controller.getDataTypeName("Chapter")};
e.chapter.index=this._playlist.clips.length-1;
e.chapter.startTime=0;
e.chapter.endTime=d.duration;
e.chapter.length=d.duration;
e.chapter.aggregateLength=d.duration;
e.chapter.globalDataType="com.theplatform.pdk.data::Chapter";
e.title=this.currentTitle;
if(this._playlist.clips.length>1){var b=this._playlist.clips[this._playlist.clips.length-2];
e.chapter.aggregateStartTime=b.chapter.aggregateStartTime+b.chapter.endTime;
e.chapter.chapters=b.chapter.chapters;
e.chapter.chapters.isAggregate=true
}else{e.chapter.chapters={globalDataType:this.controller.getDataTypeName("ChapterList"),chapters:[],aggregateStartTime:0,aggregateLength:0};
e.chapter.aggregateStartTime=0
}e.chapter.chapters.chapters.push(e.chapter);
e.chapter.chapters.aggregateLength+=d.duration;
e.chapter.endTime=e.chapter.startTime+d.duration
}else{this.processCompanions(l,m);
var n=false;
if(this.currentPlaylist&&this.currentPlaylist.clips&&this.currentPlaylist.clips.length){for(h=0;
h<this.currentPlaylist.clips.length;
h++){if(this.currentPlaylist.clips[h].URL==this.currentClip.URL&&this.currentPlaylist.clips[h].clipIndex==this.currentClip.clipIndex){n=true;
continue
}else{if(n&&!this.currentPlaylist.clips[h].baseClip.isAd){if(!this.currentPlaylist.clips[h].baseClip.banners){this.currentPlaylist.clips[h].baseClip.banners=[]
}this.currentPlaylist.clips[h].baseClip.banners=this.currentPlaylist.clips[h].baseClip.banners.concat(m.banners);
this.controller.updateClip(this.currentPlaylist.clips[h]);
break
}}}}}},isAllowedVideo:function(a){if(!a.url||a.url.length===0){return false
}if(this.mimeTypes.length===0){return true
}for(var b=0;
b<this.mimeTypes.length;
b++){if(this.mimeTypes[b]==a.type){return true
}}return false
},addVideoToBaseClip:function(a,d,c){var b={};
b.globalDataType="com.theplatform.pdk.data::FileInfo";
b.URL=a.url;
b.bitrate=a.bitrate;
b.width=a.width;
b.height=a.height;
b.type=a.type;
if(!d.possibleFiles){d.possibleFiles=[]
}d.possibleFiles.push(b);
if(c){d.defaultFI=b;
d.isAd=true;
d.noSkip=this.currentClip&&this.currentClip.baseClip?this.currentClip.baseClip.noSkip:true;
d.streamType="flashVideoUnknownMP4";
d.URL=a.url;
d.description=this.currentDescription;
d.type=a.type;
d.id=Math.floor(Math.random()*10000)+"";
d.globalDataType="com.theplatform.pdk.data::BaseClip"
}},processAd:function(a){if(!a){this.currentClip=null;
return
}if(a.adType=="InLine"){this.processInline(a)
}else{if(a.adType=="Wrapper"){this.processWrapper(a)
}}},processWrapperAdEvent:function(a){tpDebug("Processing wrapper tracking events");
this.parentWrappers.push(a)
},processWrapper:function(a){this.parentWrappers.push(a);
this.processVAST(a.vastAdData);
this.parentWrappers.pop()
},processInline:function(f){var e=this;
if(f.adTitle){this.currentTitle=f.adTitle
}if(f.description){this.currentDescription=f.description
}var d=f.video;
var a=f.companionAds;
var g=f.impressions;
var c=f.nonLinearAds;
if(!f.impressions){f.impressions=[]
}var h;
for(var b=0;
b<this.parentWrappers.length;
b++){h=this.parentWrappers[b];
f.impressions=f.impressions.concat(h.impressions)
}if(d){this.processMediaFiles(d,a,c,g)
}else{}}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VMAPProcessor=$pdk.extend(function(){},{constructor:function(a){this.controller=a;
this._adBreaks=null;
this._ready=false
},ready:function(){return this._ready
},initialize:function(){this._adBreaks=null;
this._ready=false;
this._byPosition=false;
this._preRolls=[];
this._postRolls=[]
},process:function(c,e,f){if(!c||!c.adbreaks||c.adbreaks.length===0){tpDebug("No adbreaks found",this.controller.id,"VAST");
return
}this._adBreaks=c.adbreaks;
this._ready=true;
this._byPosition=this.isPositionOnly();
var d=[];
for(var a=0;
a<this._adBreaks.length;
a++){var b=this._adBreaks[a];
if(b.timeOffset=="start"||b.timeOffset<=1000||(this._byPosition&&b.timeOffset=="#1")){this._preRolls.push(b)
}else{if(b.timeOffset=="end"||Math.abs(e-b.timeOffset)<=1000){d.push(b)
}}}this._postRolls=d.concat(this.getAdsForPosition("#"+f))
},getPreRolls:function(){return this._preRolls
},getPostRolls:function(){return this._postRolls
},getMidRollsForOffset:function(d){if(!this._adBreaks){return null
}var c=[];
for(var a=0;
a<this._adBreaks.length;
a++){var b=this._adBreaks[a];
if(Math.abs(b.timeOffset-d)<1000){c.push(b)
}}return c
},getMidRollsForPosition:function(a){return this.getAdsForPosition(a)
},isPositionOnly:function(){if(!this._adBreaks||this._adBreaks.length===0){return false
}var b;
for(var a=0;
a<this._adBreaks.length;
a++){b=this._adBreaks[a];
if(!(b.timeOffset+"").match(/^#[0-9]+$/)){return false
}}return true
},getAdsForPosition:function(c){if(!this._byPosition||!this._adBreaks||this._adBreaks.length===0){return[]
}var a=[];
for(var b=0;
b<this._adBreaks.length;
b++){if(this._adBreaks[b].timeOffset==c){a.push(this._adBreaks[b])
}}return a
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTLoader=$pdk.extend(function(){},{WRAPPER_LIMIT:10,constructor:function(a,b,d,c){this.initialize();
this.wrapperDepth=c;
this.wrapper=d;
this.followAdditionalWrappers=a;
this.allowMultipleAds=b;
if(this.followAdditionalWrappers&&this.haveReachedWrapperLimit()){tpDebug(this.WRAPPER_LIMIT+" wrappers have been followed. This is the plugin limit.","","VAST",tpConsts.WARN);
this.followAdditionalWrappers=false
}tpDebug("VASTLoader instantiated.","","VMAP")
},initialize:function(a,b){this.success=null;
this.wrapper=null;
this.wrappers=0;
this.wrapperDepth=0;
if(arguments.length==2){this.followAdditionalWrappers=a;
this.allowMultipleAds=b
}},load:function(b,d,a){var c=this;
$pdk.plugin.vast.XMLLoader.getInstance().loadXML(b,function(e){var f;
if(e instanceof window.Document){tpRemoveWhiteSpace(e);
f=e
}else{if(e.xml){f=tpParseXml(e.xml)
}else{f=tpParseXml(e)
}}tpRemoveComments(f.childNodes[0]);
c.processAds(f.childNodes[0],d,a)
},function(){a()
})
},processAds:function(f,n,a){var e=false;
if(!this.allowMultipleAds){e=this.chooseSingleAd(f)
}var k,p;
var l=false;
this.success=n;
this.failure=a;
this.xml=f;
if(!e){for(var d=0;
d<f.childNodes.length;
d++){k=f.childNodes[d];
if(!k.localName||k.localName.toLowerCase()!="ad"){f.removeChild(k);
d--;
continue
}if(k.childNodes&&k.childNodes.length==1){p=k.childNodes[0];
if(this.wrapper&&p.localName.toLowerCase()=="inline"){this.appendAdToWrapperAd(k,this.wrapper);
d--
}else{if(p.localName.toLowerCase()=="wrapper"){if(this.followAdditionalWrappers){var g;
for(var c=0;
c<p.childNodes.length;
c++){if(p.childNodes[c].localName.toLowerCase()=="vastadtaguri"){g=this.parseSimpleUrl(p.childNodes[c])
}}if(!g){a();
return
}g=g.replace("&amp;","&");
var o=this.followAdditionalWrappers;
if(p.attributes.followAdditionalWrappers&&p.attributes.followAdditionalWrappers.nodeValue){o=p.attributes.followAdditionalWrappers.nodeValue!=="false"
}var b=this.allowMultipleAds;
if(p.attributes.allowMultipleAds&&p.attributes.allowMultipleAds.nodeValue){b=p.attributes.allowMultipleAds.nodeValue!=="false"
}l=true;
this.wrappers++;
k.appendChild(document.createElement("VASTAdData"));
if(this.wrapper){this.appendAdToWrapperAd(k,this.wrapper);
d--
}var m=new $pdk.plugin.vast.VASTLoader(o,b,k,this.wrapperDepth+1);
var h=this;
m.load(g,function(j){h.check()
},function(){h.check()
})
}else{f.removeChild(k);
d--
}}}}}}if(l){}else{if(this.haveReachedWrapperLimit()){this.stripDeadEndWrapperBranch()
}if(f.childNodes.length>0){n(f)
}else{a()
}}},stripDeadEndWrapperBranch:function(){var d=this.wrapper,a=this.elementsByTagNameInsensitive(this.wrapper,"VASTAdData");
if(a&&a.length>0&&a.childNodes&&a.childNodes.length>0){}else{d=this.wrapper.parentNode;
while(d){if(d.localName.toLowerCase()=="vastaddata"){try{var b=this.getFirstWrapper(d.childNodes);
if(d.childNodes.length>1){d.removeChild(b);
break
}d.removeChild(b)
}catch(c){break
}}d=d.parentNode&&d.parentNode.localName?d.parentNode:undefined
}}},getFirstWrapper:function(a){for(var b=0;
b<a.length;
b++){if(a[b].childNodes[0].localName.toLowerCase()=="wrapper"){return a[b]
}}return null
},chooseSingleAd:function(d){var g,f,b,a;
var e=d.childNodes.length;
var c=false;
for(g=0;
g<e;
g++){b=d.childNodes[g];
if(b.childNodes&&b.childNodes.length==1){a=b.childNodes[0];
if(a.localName.toLowerCase()=="inline"&&!(b.attributes.sequence&&b.attributes.sequence.nodeValue)){c=true;
if(this.wrapper){this.appendAdToWrapperAd(b,this.wrapper)
}else{for(f=e;
f>0;
f--){if(d.childNodes[f-1]!==b){d.removeChild(d.childNodes[f-1])
}}}break
}}}if(!c){for(g=e;
g>0;
g--){b=d.childNodes[g-1];
if(b.childNodes&&b.childNodes.length==1){a=b.childNodes[0];
if(a.localName.toLowerCase()=="inline"){d.removeChild(b)
}}}}return c
},appendAdToWrapperAd:function(d,c){var a=this.elementsByTagNameInsensitive(c,"VASTAdData");
if(a&&a.length>0){this.elementsByTagNameInsensitive(c,"VASTAdData")[0].appendChild(d)
}else{var f=c.childNodes;
var e;
for(var g=0;
f.length;
g++){e=f[g];
if(e.localName.toLowerCase()=="vastaddata"){break
}e=undefined
}if(e){c.removeChild(e)
}var b=document.createElement("VASTAdData");
b.appendChild(d);
c.appendChild(b)
}},haveReachedWrapperLimit:function(){return this.wrapperDepth>=this.WRAPPER_LIMIT
},check:function(){this.wrappers--;
if(this.wrappers===0){if(this.xml.childNodes.length>0){this.success(this.xml)
}else{this.failure()
}}},elementsByTagNameInsensitive:function(a,b){var c=a.getElementsByTagName(b);
if(c&&c.length>0){return c
}return a.getElementsByTagName(b.toLowerCase())
},parseSimpleUrl:function(a){if(a&&a.nodeValue){return a.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].nodeValue){return a.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].textContent){return a.childNodes[0].textContent.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{return null
}}}},logXmlFromRoot:function(a){var b=a;
while(b){if(b.parentNode){b=b.parentNode
}else{break
}}}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.XMLLoader=$pdk.extend(function(){},{constructor:function(a){if($pdk.plugin.vast.XMLLoader._instance){this.loadXML=null;
throw"$pdk.plugin.vast.XMLLoader is a Singlton. Access via getInstance()"
}this.hosts=[];
for(var b=0;
b<a.length;
b++){this.hosts[a[b]]={withCredentials:true}
}$pdk.plugin.vast.XMLLoader._instance=this;
this.urlparser=document.createElement("a");
tpDebug("XMLLoader instantiated.","","XMLLoader")
},_hostSupportsCredentials:function(b,e,d){this.urlparser.href=b;
var c=this.urlparser.hostname;
var a=this;
if(this.hosts[c]){if(this.hosts[c].withCredentials){e()
}else{d()
}}else{a.hosts[c]={withCredentials:false};
d()
}},loadXML:function(c,d,b){var a=this;
this._hostSupportsCredentials(c,function(){a.doLoadXML(c,true,d,b)
},function(){a.doLoadXML(c,false,d,b)
})
},doLoadXML:function(a,d,j,b){tpDebug("Loading VMAP or VAST XML From url: "+a);
var f=false;
var k=false;
var l;
if(typeof XMLHttpRequest!=="undefined"&&"withCredentials" in new XMLHttpRequest()){l=new XMLHttpRequest()
}else{if(typeof XDomainRequest!=="undefined"){k=true;
l=new XDomainRequest();
tpDebug("Using XDomainRequest, since XMLHttpRequest isn't fully supported.")
}else{b("This browser does not support XMLHttpRequest or XDomainRequest.")
}}if(d&&l&&("withCredentials" in l)){l.withCredentials=true
}else{}var h=this;
var c=function(){var n,m;
if(this.readyState===4&&this.status===200&&!f){f=true;
n=l.responseXML;
if(!n){n=l.responseText
}try{j(n)
}catch(o){tpDebug("Error parsing Vast XML: "+n,"Vast",tpConsts.ERROR);
b();
if(tpLogLevel=="debug"){throw o
}}}else{if(this.readyState===4&&this.status===404&&!f){f=true;
b()
}else{if(k&&!f){f=true;
try{j(l.responseText)
}catch(p){tpDebug("Error parsing Vast XML: "+l.responseText,"XMLLoader",tpConsts.WARN);
b();
if(tpLogLevel=="debug"){throw p
}}}}}};
if(k){l.onload=c
}else{l.onreadystatechange=c
}l.onerror=function(e){tpDebug("Error loading VMAP or VAST XML from url:"+a,"","XMLLoader",tpConsts.WARN);
f=true;
b()
};
try{l.open("GET",a);
l.send(null);
setTimeout(function(){if(!f){f=true;
b()
}},5000)
}catch(g){tpDebug(g.message,"","XMLLoader");
b()
}}});
$pdk.plugin.vast.XMLLoader.hosts=["pubads.g.doubleclick.net","ads.doubleclick.net"];
$pdk.plugin.vast.XMLLoader.getInstance=function(a){if(!$pdk.plugin.vast.XMLLoader._instance){$pdk.plugin.vast.XMLLoader._instance=new $pdk.plugin.vast.XMLLoader($pdk.plugin.vast.XMLLoader.hosts)
}return $pdk.plugin.vast.XMLLoader._instance
};
$pdk.plugin.vast.XMLLoader.getInstance();
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.AdTracking=$pdk.extend(function(){},{TRIGGER_TYPE_PERCENTAGE:0,TRIGGER_TYPE_MILLISECONDS:1,TRIGGER_TYPE_EVENT:2,EVENT_MUTE:0,EVENT_PAUSE:1,EVENT_REPLAY:2,EVENT_FULL_SCREEN:3,EVENT_STOP:4,EVENT_START:5,EVENT_UNPAUSE:6,EVENT_CLOSE:7,EVENT_UNMUTE:8,EVENT_ACCEPTINVITATION:9,constructor:function(){},getTrackingUrl:function(c){var b=c.event;
var a=c.urls[0].url;
switch(b.toLowerCase()){case"start":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,0);
case"firstquartile":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,25);
case"midpoint":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,50);
case"thirdquartile":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,75);
case"mute":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_MUTE);
case"unmute":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNMUTE);
case"pause":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_PAUSE);
case"unpause":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNPAUSE);
case"replay":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_REPLAY);
case"stop":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_STOP);
case"resume":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNPAUSE);
case"close":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_CLOSE);
case"complete":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,100);
case"acceptinvitation":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_ACCEPTINVITATION);
case"expand":case"fullscreen":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_FULL_SCREEN);
default:return null
}},setTracking:function(b,c,d){var a={};
a.triggerType=c;
a.triggerValue=d;
a.URL=b;
a.hasFired=false;
a.globalDataType="com.theplatform.pdk.data::TrackingUrl";
return a
},sendTrackingUrl:function(a){if(a.indexOf("ord=")===-1){var b=100000+Math.floor(Math.random()*900001);
a+=(a.indexOf("?")===-1?"?":"&");
a+="ord="+b
}a+=(a.indexOf("?")===-1?"?":"&");
a+="source=vastplugin"
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.BannerManager=$pdk.extend(function(){},{constructor:function(a,c){var b=this;
this.controller=a;
this.controller.addEventListener("OnMediaStart",function(d){b.onMediaStart(d)
});
this.controller.addEventListener("OnMediaEnd",function(d){b.onMediaEnd(d)
});
this.divs={};
this.map=c;
this.a={}
},onMediaStart:function(c){var b=c.data;
var d=b.baseClip.banners;
if(d){for(var a=0;
a<d.length;
a++){this.showBanner(d[a])
}}},onMediaEnd:function(c){var b=c.data;
var d=b.baseClip.banners;
if(d){for(var a=0;
a<d.length;
a++){}}},showBanner:function(b){if(!this.banners){this.banners=[]
}var g=this.getDivForBanner(b);
if(g){g.innerHTML="";
var e=document.createElement("a");
var c=document.createElement("img");
this.divs[b]=g;
this.a[b]=e;
if(b.src){c.src=b.src
}g.style["text-align"]="center";
var f=this;
e.href=b.href;
e.target="_blank";
e.style.position="relative";
e.appendChild(c);
e.onclick=function(){for(var h=0;
h<b.clickTracking.length;
h++){this.sendTrackingUrl(b.clickTracking[h])
}};
g.appendChild(e);
if(b.impressionUrls){var a=b.impressionUrls.length;
var d=0;
for(;
d<a;
d++){this.sendTrackingUrl(b.impressionUrls[d])
}}this.banners.push(b)
}},getDivForBanner:function(a){var c;
var b;
for(c in this.map){b=document.getElementById(c);
if(b){if(this.map[c].width===-1){this.map[c].width=b.offsetWidth
}if(this.map[c].height===-1){this.map[c].height=b.offsetHeight
}if(a.bannerWidth===this.map[c].width&&a.bannerHeight===this.map[c].height){return b
}}}for(c in this.map){if(a.bannerWidth<=this.map[c].width&&a.bannerHeight<=this.map[c].height){return document.getElementById(c)
}}for(c in this.map){return document.getElementById(c)
}return null
},layout:function(){if(this.banners){for(var a=0;
a<this.banners.length;
a++){this.doLayout(this.banners[a],this.divs[this.banners[a]],this.a[this.banners[a]])
}}},doLayout:function(a,c,b){if(a.bannerHeight){c.style.height=a.bannerHeight+"px";
b.style.height=a.bannerHeight+"px";
b.style.display="block"
}if(a.bannerWidth){c.style.width=a.bannerWidth+"px";
b.style.width=a.bannerWidth+"px"
}b.style.marginLeft="auto";
b.style.marginRight="auto";
c.style.width="100%"
},removeBanner:function(a){var c=this.getDivForBanner(a);
if(c){c.innerHTML=""
}for(var b=0;
this.banners&&b<this.banners.length;
b++){if(this.banners[b]==a){this.banners.splice(b,1);
break
}}},removeAllBanners:function(){this.banners=undefined
},sendTrackingUrl:function(a){if(a.indexOf("ord=")===-1){var b=100000+Math.floor(Math.random()*900001);
a+=(a.indexOf("?")===-1?"?":"&");
a+="ord="+b
}a+=(a.indexOf("?")===-1?"?":"&");
a+="source=vastplugin"
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.OverlayManager=$pdk.extend(function(){},{constructor:function(b,a){var c=this;
this.controller=b;
this.overlayLayer=a;
this.controller.addEventListener("OnOverlayAreaChanged",function(d){c.layout()
});
this.divs={};
this.a={}
},showOverlay:function(d){if(!this.overlays){this.overlays=[]
}var b=document.createElement("div");
if(d.guid){b.id="tpVastPlugInoverlay"+d.guid
}var f=document.createElement("a");
var c=document.createElement("img");
this.divs[d]=b;
this.a[d]=f;
if(d.src){c.src=d.src
}if(d.stretchToFit&&!d.maintainAspectRatio){c.style.height="100%";
c.style.width="100%"
}else{if(d.stretchToFit&&d.bannerHeight>d.bannerWidth){c.style.height="100%"
}else{if(d.stretchToFit){c.style.width="100%"
}}}b.style.position="absolute";
b.style["text-align"]="center";
var g=this;
f.href=d.href;
f.target="_blank";
f.style.position="relative";
f.appendChild(c);
b.appendChild(f);
if(d.impressionUrls){var a=d.impressionUrls.length;
var e=0;
for(;
e<a;
e++){this.sendTrackingUrl(d.impressionUrls[e])
}}this.doLayout(d,b,f);
this.overlays.push(d);
this.overlayLayer.appendChild(b);
var h=document.createElement("canvas");
if(h&&h.getContext&&h.getContext("2d")){h.width=15;
h.height=15;
h.style.position="absolute";
h.style.top="0";
h.style.right="0";
f.onclick=function(j){if(j.target!=h){g.controller.pause(true)
}};
h.onclick=function(){g.removeOverlay(d);
return false
};
this.drawCloseButton(h,"#"+this.controller.getProperty("controlframecolor").substr(2),"#"+this.controller.getProperty("controlbackgroundcolor").substr(2),"#"+this.controller.getProperty("controlcolor").substr(2));
f.appendChild(h)
}},layout:function(){if(this.overlays){for(var a=0;
a<this.overlays.length;
a++){this.doLayout(this.overlays[a],this.divs[this.overlays[a]],this.a[this.overlays[a]])
}}},doLayout:function(b,a,c){if(b.bannerHeight){a.style.height=b.bannerHeight+"px";
c.style.height=b.bannerHeight+"px";
c.style.display="block"
}if(b.bannerWidth){a.style.width=b.bannerWidth+"px";
c.style.width=b.bannerWidth+"px"
}c.style.marginLeft="auto";
c.style.marginRight="auto";
a.style.width="100%";
var d=this.controller.getOverlayArea();
a.style.top=((d.height-b.bannerHeight))+"px"
},drawCloseButton:function(c,e,d,b){var a=c.getContext("2d");
a.clearRect(0,0,15,15);
a.fillStyle=d;
a.strokeStyle=e;
a.fillRect(0,0,15,15);
a.strokeStyle=e;
a.moveTo(0,0);
a.lineTo(15,0);
a.lineTo(15,15);
a.lineTo(0,15);
a.lineTo(0,0);
a.stroke();
a.strokeStyle=b;
a.lineWidth=3;
a.moveTo(4,4);
a.lineTo(11,11);
a.moveTo(4,11);
a.lineTo(11,4);
a.stroke()
},removeOverlay:function(b){var a;
if(b.id){a=document.getElementById(b.id)
}else{a=document.getElementById("tpVastPlugInoverlay"+b.guid)
}if(a){this.overlayLayer.removeChild(a)
}for(var c=0;
this.overlays&&c<this.overlays.length;
c++){if(this.overlays[c]==b){this.overlays.splice(c,1);
break
}}},removeAllOverlays:function(){this.overlays=undefined;
this.overlayLayer.innerHTML=""
},sendTrackingUrl:function(a){if(a.indexOf("ord=")===-1){var b=100000+Math.floor(Math.random()*900001);
a+=(a.indexOf("?")===-1?"?":"&");
a+="ord="+b
}a+=(a.indexOf("?")===-1?"?":"&");
a+="source=vastplugin"
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTPlugIn=$pdk.extend(function(){},{nextPercentage:null,_enablePods:false,VPAID_FLASH_MIMETYPE:"application/x-shockwave-flash",VPAID_JS_MIMETYPE:"application/javascript",mimeTypeTable:{f4m:"application/f4m+xml",m3u:"application/x-mpegURL",mpeg4:"video/mp4","mpeg-dash":"application/dash+xml",flv:"video/x-flv",qt:"video/quicktime",js:this.VPAID_JS_MIMETYPE,swf:this.VPAID_FLASH_MIMETYPE},skipOffsets:{},defaultTypes:["video/mp4"],overlayManager:null,bannerManager:null,constructor:function(){this.container=document.createElement("div");
this.container.style.display="";
this.container.style.width="100%";
this.overlayLayer=document.createElement("div");
this.overlayLayer.id="overlaylayer";
this.overlayLayer.style.height="100%";
this.overlayLayer.style.width="100%";
this.overlayLayer.style.position="relative";
this.overlayLayer.style.display="";
this.container.appendChild(this.overlayLayer)
},onEnded:function(a){this.done()
},initialize:function(k){var l=this;
this.controller=k.controller;
this.controller.registerAdPlugIn(this);
this.controller.registerPlaylistPlugIn(this);
this.priority=k.priority;
this.hasFlash=this.controller.component.videoengineruntime==="flash";
this.overlayManager=new $pdk.plugin.vast.OverlayManager(this.controller,this.overlayLayer);
var o=k.vars.enableVPAID!=="false";
this.enableVPAID=o;
var h=k.vars.hosts;
if(h&&h.length){this.hosts=h.split(",")
}var f=k.vars.acceptsCredentials;
if(f&&f.length){f=f.split(",");
$pdk.plugin.vast.XMLLoader.hosts=$pdk.plugin.vast.XMLLoader.hosts.concat(f)
}var d;
var m="leader,companion";
var p;
if(m){var e=m.split(",");
var a;
if(e){p={};
for(d=0;
d<e.length;
d++){m=e[d];
a=m.split(":");
if(a&&a.length===2&&a[1].indexOf("x")>0){p[a[0]]={width:parseInt(a[1].split("x")[0],10),height:parseInt(a[1].split("x")[1],10)}
}else{if(a&&a.length===1){p[a[0]]={width:-1,height:-1}
}}}}}this.bannerManager=new $pdk.plugin.vast.BannerManager(this.controller,p);
this.mimeTypes=[];
if(this.controller.getProperty("formats")){var n=this.controller.getProperty("formats").split(",");
var j;
for(d=0;
d<n.length;
d++){j=this.mimeTypeTable[n[d].toLowerCase()];
if(j){this.mimeTypes.push(j)
}}for(d=0;
d<this.defaultTypes.length;
d++){if(this.mimeTypes.indexOf(this.defaultTypes[d])==-1){this.mimeTypes.push(this.defaultTypes[d])
}}}else{this.mimeTypes=this.defaultTypes.concat()
}var b=k.vars.mimeType;
if(b){this.mimeTypes.push(b)
}else{b=k.vars.mimeTypes;
if(b){this.mimeTypes=this.mimeTypes.concat(b.split(","))
}}if(this.enableVPAID&&this.hasFlash&&this.mimeTypes.indexOf(this.VPAID_FLASH_MIMETYPE)<0){this.mimeTypes.unshift(this.VPAID_FLASH_MIMETYPE)
}else{if(this.enableVPAID&&this.mimeTypes.indexOf(this.VPAID_JS_MIMETYPE)<0){}}var g=k.vars.enablePods;
if(g&&g.toLowerCase()==="true"){this._enablePods=true
}var c=k.vars.allowClicks;
if(c&&c.toLowerCase()==="false"){this.allowClicks=false
}else{this.allowClicks=true
}this._vastLoader=new $pdk.plugin.vast.VASTLoader(true,true);
this._vastProcessor=new $pdk.plugin.vast.VASTProcessor(this.controller,this._enablePods,this.mimeTypes,this.allowClicks);
this._vmapProcessor=new $pdk.plugin.vast.VMAPProcessor(this.controller);
this.controller.addEventListener("OnMediaLoadStart",function(q){if(l._vpaidPlayer&&l._vpaidClip.id===q.data.id){l._vpaidPlayer.start()
}l.currentClip=q.data;
l.nextPercentage=null
});
this.controller.addEventListener("OnMediaEnd",function(q){l.onEnded(q);
l.currentClip=null
});
this.controller.addEventListener("OnMediaStart",function(q){l.onMediaStart.apply(l,[q])
});
this.controller.addEventListener("OnMediaPlaying",function(q){if(l.currentPlaylistClip&&l.skipOffsets[l.currentPlaylistClip.id]&&!isNaN(l.skipOffsets[l.currentPlaylistClip.id])){if(q.data.currentTime>l.skipOffsets[l.currentPlaylistClip.id]){delete l.skipOffsets[l.currentPlaylistClip.id];
l.currentPlaylistClip.baseClip.noSkip=false;
l.controller.updateClip(l.currentPlaylistClip)
}}});
this.controller.addEventListener("OnMediaEnd",function(q){l.onMediaEnd.apply(l,[q])
});
this.controller.addEventListener("OnReleaseEnd",function(q){l.onReleaseEnd.apply(l,[q])
});
this.controller.addEventListener("OnSetRelease",function(q){l.onReleaseEnd.apply(l,[q])
});
this.controller.addEventListener("OnSetReleaseUrl",function(q){l.onReleaseEnd.apply(l,[q])
});
this.controller.addEventListener("OnLoadReleaseUrl",function(q){l.onReleaseEnd.apply(l,[q])
});
this.controller.addEventListener("OnSetRelease",function(q){l.onReleaseEnd.apply(l,[q])
});
this.controller.addEventListener("OnSetReleaseUrl",function(q){l.onReleaseEnd.apply(l,[q])
});
this.controller.addEventListener("OnLoadReleaseUrl",function(q){l.onReleaseEnd.apply(l,[q])
});
tpDebug("*** VAST plugin LOADED! ***")
},destroy:function(){},onMediaStart:function(f){var d=f.data;
if(!d.baseClip.isAd&&this.currentOverlays){for(var b=0;
b<this.currentOverlays.length;
b++){var a=this.currentOverlays[b];
this.overlayManager.showOverlay(a);
var c=this;
setTimeout(function(){c.overlayManager.removeOverlay(a)
},10000)
}}else{if(d.baseClip.isAd){this.currentPlaylistClip=d;
if(!this.currentOverlays){this.currentOverlays=[]
}if(d.baseClip.overlays){this.currentOverlays=this.currentOverlays.concat(d.baseClip.overlays.concat())
}}}},onMediaEnd:function(b){var a=b.data;
if(!a.baseClip.isAd){this.currentOverlays=[];
this.overlayManager.removeAllOverlays()
}},onReleaseEnd:function(a){this.overlayLayer.innerHTML="";
this.currentOverlays=[]
},replacePlaylist:function(d){var b;
var a;
if(d.metaTags){for(var c=0;
c<d.metaTags.length;
c++){if(d.metaTags[c].name=="adPlaylistUrl"){b=d.metaTags[c].content;
if(d.metaTags.length>c+1){a=d.metaTags[c+1].content
}break
}}}if(b){this.doLoadVMAP(d,b,a);
return true
}else{return false
}},doLoadVMAP:function(d,b,a){var c=this;
b=this.doUrlSubstitutions(b);
$pdk.plugin.vast.XMLLoader.getInstance().loadXML(b,function(p){if(!c._playlistProcessor){c._playlistProcessor=new $pdk.plugin.vast.PlaylistProcessor(c.controller.scopes)
}var e=$pdk.plugin.vast.VMAPParser.getInstance();
var l=d.chapters.aggregateLength;
result=e.parse(p,l);
c._vmapProcessor.initialize();
c._vmapProcessor.process(result,l,d.chapters.chapters?d.chapters.chapters.length+1:2);
var r=c._vmapProcessor.getPreRolls();
var f;
var o=c._vmapProcessor.getPostRolls();
var k=d.clips.length-1;
var g;
var h=this.currentClip&&this.currentClip.baseClip?this.currentClip.baseClip.noSkip:true;
var n;
if(o&&o.length){for(n=0;
n<o.length;
n++){g=c._playlistProcessor.createClip(o[n].adTagUri,"VAST Ad","",true,h,"application/vast+xml");
g.baseClip.trackingData=""+o[n].allowMultipleAds+"|"+o[n].followRedirects;
c._playlistProcessor.splice(d,k+n+1,0,g)
}}var q=!c._vmapProcessor.isPositionOnly();
for(var m=k;
m>0;
m--){f=q?c._vmapProcessor.getMidRollsForOffset(d.clips[m].startTime):c._vmapProcessor.getMidRollsForPosition("#"+(m+1));
if(f&&f.length){for(n=0;
n<f.length;
n++){g=c._playlistProcessor.createClip(f[n].adTagUri,"VAST Ad","",true,h,"application/vast+xml");
g.baseClip.trackingData=""+f[n].allowMultipleAds+"|"+f[n].followRedirects;
c._playlistProcessor.splice(d,m+n,0,g)
}}}if(r&&r.length){for(n=0;
n<r.length;
n++){g=c._playlistProcessor.createClip(r[n].adTagUri,"VAST Ad","",true,h,"application/vast+xml");
g.baseClip.trackingData=""+r[n].allowMultipleAds+"|"+r[n].followRedirects;
c._playlistProcessor.splice(d,n,0,g)
}}c.controller.playlistReplaced(d)
},function(){if(a){c.doLoadVMAP(d,a,null)
}else{c.controller.playlistReplaced(d)
}})
},isAd:function(a){return(this.isVastUrl(a.URL)||this.isVastUrl(a.baseURL))
},checkAd:function(e){var a=(!e.mediaLength||e.mediaLength<=0)&&(this.isVastUrl(e.baseClip.URL)||e.baseClip.type=="application/vast+xml")||e.baseClip.type=="application/vmap+xml";
if(a){if(!e.baseClip.type||e.baseClip.type&&(e.baseClip.type.toLowerCase()==="application/xml"||e.baseClip.type.toLowerCase()==="application/vast+xml"||e.baseClip.type.toLowerCase()==="text/xml")){this._vastProcessor.initialize()
}else{return false
}this.currentClip=e;
this.originalClip=e;
var d=this;
var b=true;
var f=true;
if(e.baseClip.trackingData&&e.baseClip.trackingData.indexOf("|")>=0){b=e.baseClip.trackingData.split("|")[0]=="false"?false:true;
f=e.baseClip.trackingData.split("|")[1]=="false"?false:true
}if(e.baseClip.URL.indexOf("vmap-parser:")===0){var c=$pdk.plugin.vast.VMAPParser.getInstance().getVASTResponse(e.baseClip.URL);
if(c){this._vastLoader.initialize(f,b);
this._vastLoader.processAds(c,function(g){var h=$pdk.plugin.vast.VASTParser.getInstance();
result=h.parse(g);
setTimeout(function(){d.processVAST(result)
},1)
},function(){setTimeout(function(){d.vastError()
},1)
})
}else{setTimeout(function(){d.vastError()
},1)
}return true
}setTimeout(function(){d._vastLoader.initialize(f,b);
d._vastLoader.load(d.doUrlSubstitutions(e.baseClip.URL),function(g){var h=$pdk.plugin.vast.VASTParser.getInstance();
result=h.parse(g);
d.processVAST(result)
},function(){d.vastError()
})
},1);
return true
}else{if(e.baseClip.type==this.VPAID_FLASH_MIMETYPE||e.baseClip.type==this.VPAID_JS_MIMETYPE){if(!this._vpaidPlayer){this._vpaidPlayer=new $pdk.plugin.vpaid.player.VPAIDPlayer(this.controller,this.overlayLayer)
}this._vpaidClip=e;
this._vpaidPlayer.initVPAIDAd(e);
return false
}}return false
},doUrlSubstitutions:function(a){var b=document.location.href;
if($pdk.parentUrl){b=$pdk.parentUrl
}var c=this.controller.getMediaArea();
a=a.replace(/\[timestamp\]/gi,(new Date()).getTime());
a=a.replace(/\[page_url\]/gi,escape(b));
a=a.replace(/\[player_width\]/gi,c.width);
a=a.replace(/\[player_height\]/gi,c.height);
a=a.replace(/\[player_dimensions\]/gi,c.width+"x"+c.height);
return a
},processVAST:function(a){if(a){var b=this;
if(a.ads){this._vastProcessor.process(a,function(c){b.vastSuccess(c)
},function(){b.vastError()
})
}else{this.vastError()
}}else{this.vastError()
}},vastError:function(){tpDebug("VAST Error. Resuming content.",this.controller.id,"VAST");
this.currentClip=null;
this.controller.setAds(null)
},vastSuccess:function(b){tpDebug("VAST Success. Play ads.",this.controller.id,"VAST");
for(var a=0;
a<b.clips.length;
a++){this.skipOffsets[b.clips[a].id]=b.clips[a].skipOffset
}tpDebug(b.clips.length+" clips to be played",this.controller.id,"VAST");
this.controller.setAds(b)
},done:function(){this.overlayManager.removeAllOverlays()
},isVastUrl:function(a){if(!a||!this.hosts||this.hosts.length===0){return false
}for(var b=0;
b<this.hosts.length;
b++){if(a.match(this.hosts[b])){return true
}}return false
},log:function(a){}});
var vastPlugIn=new $pdk.plugin.vast.VASTPlugIn();
tpController.plugInLoaded(vastPlugIn,vastPlugIn.container);
$pdk.ns("$pdk.plugin.vpaid.player");
$pdk.plugin.vpaid.player.PdkNoopPlayer=$pdk.extend(function(){},{_controller:null,_volumeSetCallback:null,_muteSetCallback:null,_pauseSetCallback:null,_onPlayerPauseListener:null,_onPlayerUnpauseListener:null,_onVolumeChangeListener:null,_onMuteListener:null,_active:false,constructor:function(a,c){this._controller=a;
this._seekSetCallback=c.mediaSeekSet;
this._volumeSetCallback=c.mediaSoundLevelSet;
this._muteSetCallback=c.mediaMuteSet;
this._pauseSetCallback=c.mediaPauseSet;
this._endSetCallback=c.mediaEndSet;
this._closeSetCallback=c.mediaCloseSet;
var b=this;
this._onPlayerUnpauseListener=function(){b._onPlayerUnpause.apply(b,arguments)
};
this._onPlayerPauseListener=function(){b._onPlayerPause.apply(b,arguments)
};
this._onVolumeChangeListener=function(){b._onVolumeChange.apply(b,arguments)
};
this._onMuteListener=function(){b._onMute.apply(b,arguments)
};
this._onResetPlayerListener=function(){b._onResetPlayer.apply(b,arguments)
};
this._onMediaEndListener=function(){b._onMediaEnd.apply(b,arguments)
}
},activate:function(a){this._active=true;
this._clip=a;
this._addPlaybackListeners()
},deactivate:function(){this._active=false;
this._removePlaybackListeners()
},mediaStarts:function(){if(this._active){this._controller.dispatchEvent("OnMediaStart",this._clip)
}},mediaPause:function(b){if(this._active){var a={globalDataType:"com.theplatform.pdk.data::MediaPause",userInitiated:false,clip:this._clip};
if(b){this._controller.dispatchEvent("OnMediaPause",a)
}else{this._controller.dispatchEvent("OnMediaUnpause",a)
}}},mediaPlaying:function(b){if(this._active){var a={currentTime:b,duration:this._clip.mediaLength,percentComplete:b/this._clip.mediaLength*100};
this._controller.dispatchEvent("OnMediaPlaying",a)
}},mediaEnds:function(){if(this._active){this._controller.endMedia(this._clip)
}},mediaError:function(a){tpDebug(a,this._controller.id,"NoOpPlayer",tpConsts.WARN);
if(!this._active){this._controller.endMedia()
}else{this.mediaEnds()
}},done:function(a){if(this._active){var b=this._controller;
var c=a;
var e=this;
setTimeout(function d(){e.log("on async, call endMedia");
e.controller.endMedia(c)
},10)
}},_onVolumeChange:function(a){if(this._active){this._volumeSetCallback(parseInt(a.data,10))
}},_onMute:function(a){if(this._active){this._muteSetCallback(a.data)
}},_onPlayerPause:function(b){var a="PdkNoopPlayer::onPlayerPause";
if(this._pauseSetCallback&&this._active){tpDebug(a+"- calling pauseSetCallback with True");
this._pauseSetCallback(true)
}},_onPlayerUnpause:function(b){var a="PdkNoopPlayer::onPlayerUnpause";
if(this._pauseSetCallback&&this._active){tpDebug(a+"- calling pauseSetCallback with False");
this._pauseSetCallback(false)
}},_onResetPlayer:function(){this._closeSetCallback()
},_onMediaEnd:function(){this._endSetCallback()
},_addPlaybackListeners:function(){tpDebug("Adding Playback Listeners for NoOp control.");
this._controller.addEventListener("OnPlayerPause",this._onPlayerPauseListener);
this._controller.addEventListener("OnPlayerUnPause",this._onPlayerUnpauseListener);
this._controller.addEventListener("OnVolumeChange",this._onVolumeChangeListener);
this._controller.addEventListener("OnMute",this._onMuteListener);
this._controller.addEventListener("OnResetPlayer",this._onResetPlayerListener);
this._controller.addEventListener("OnMediaEnd",this._onMediaEndListener)
},_removePlaybackListeners:function(){tpDebug("Removing Playback Listeners for NoOp control.");
this._controller.removeEventListener("OnPlayerPause",this._onPlayerPauseListener);
this._controller.removeEventListener("OnPlayerUnPause",this._onPlayerUnpauseListener);
this._controller.removeEventListener("OnVolumeChange",this._onVolumeChangeListener);
this._controller.removeEventListener("OnMute",this._onMuteListener);
this._controller.removeEventListener("OnResetPlayer",this._onResetPlayerListener);
this._controller.removeEventListener("OnMediaEnd",this._onMediaEndListener)
},dispose:function(){this.log("dispose");
this._controller=null;
this._volumeSetCallback=null;
this._muteSetCallback=null;
this._pauseSetCallback=null;
this._mediaPlayingCallback=null;
this._callbackScope=null;
this._currentReleasePlaylistAdClip=null;
this._onPlayerUnpauseListener=null;
this._onPlayerPauseListener=null;
this._onVolumeChangeListener=null;
this._onMuteListener=null
},log:function(b,c){if(!c){c=tpConsts.DEBUG
}var a=this._controller?this._controller.id:"";
tpDebug(b,a,"NoOpPlayer",c)
}});
$pdk.ns("$pdk.plugin.vpaid.player");
$pdk.ns("$pdk.plugin.vpaid.VPAIDEvent");
$pdk.plugin.vpaid.VPAIDEvent.AdClickThru="AdClickThru";
$pdk.plugin.vpaid.VPAIDEvent.AdError="AdError";
$pdk.plugin.vpaid.VPAIDEvent.AdExpandedChange="AdExpandedChange";
$pdk.plugin.vpaid.VPAIDEvent.AdImpression="AdImpression";
$pdk.plugin.vpaid.VPAIDEvent.AdLinearChange="AdLinearChange";
$pdk.plugin.vpaid.VPAIDEvent.AdLoaded="AdLoaded";
$pdk.plugin.vpaid.VPAIDEvent.AdLog="AdLog";
$pdk.plugin.vpaid.VPAIDEvent.AdPaused="AdPaused";
$pdk.plugin.vpaid.VPAIDEvent.AdPlaying="AdPlaying";
$pdk.plugin.vpaid.VPAIDEvent.AdRemainingTimeChange="AdRemainingTimeChange";
$pdk.plugin.vpaid.VPAIDEvent.AdStarted="AdStarted";
$pdk.plugin.vpaid.VPAIDEvent.AdStopped="AdStopped";
$pdk.plugin.vpaid.VPAIDEvent.AdUserAcceptInvitation="AdUserAcceptInvitation";
$pdk.plugin.vpaid.VPAIDEvent.AdUserClose="AdUserClose";
$pdk.plugin.vpaid.VPAIDEvent.AdUserMinimize="AdUserMinimize";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoComplete="AdVideoComplete";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoFirstQuartile="AdVideoFirstQuartile";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoMidpoint="AdVideoMidpoint";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoStart="AdVideoStart";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoThirdQuartile="AdVideoThirdQuartile";
$pdk.plugin.vpaid.VPAIDEvent.AdVolumeChange="AdVolumeChange";
$pdk.plugin.vpaid.VPAIDEvent.AdSkippableStateChange="AdSkippableStateChange";
$pdk.plugin.vpaid.player.VPAIDPlayer=$pdk.extend(function(){},{version:"VERSION_UNKNOWN",LOAD_TIMEOUT:10000,INIT_TIMEOUT:10000,START_TIMEOUT:10000,RESUME_TIMEOUT:10000,LOAD:"load",INIT:"init",START:"start",RESUME:"resume",NONE:"none",_controller:null,_scrubberTimer:null,_soundLevel:null,_muted:false,_position:0,_currentAd:null,_clip:null,_mediaArea:null,_pauseStateMachine:null,_loadPercentage:0,_useRemainingTime:false,_linearPending:false,_loadStartChecked:false,_waitingForPossibleIndecisiveLinearAd:false,_injectionPending:false,_adVideoStarted:false,_adVideoStarting:false,_adVideoComplete:false,_adStarted:false,_adStopped:false,_adLoading:false,_adLoaded:false,_adWrapper:null,_errorTimer:null,_errorStage:this.NONE,_startCalled:false,_volume:1,constructor:function(b,a){this._controller=b;
this._container=a;
tpConsts.StreamType={};
tpConsts.StreamType.EMPTY="empty";
var d=this;
this._controller.trace=function(f,e,g){tpDebug(f,d._controller.widgetId,e,g)
};
this._controller.addEventListener("OnReleaseEnd",function(f){d.handleReleaseEnd(f)
});
this._controller.addEventListener("OnClearCurrentRelease",function(f){d.handleClearCurrentRelease(f)
});
this._controller.addEventListener("OnResetPlayer",function(f){d.handleClearCurrentRelease(f)
});
this._controller.addEventListener("OnMediaEnd",function(f){d.handleMediaEnd(f)
});
this._controller.addEventListener("OnShowFullScreen",function(f){d.handleShowFullScreen(f)
});
var c={mediaEndSet:function(){d.requestMediaEnd()
},mediaCloseSet:function(){d.requestMediaClose()
},mediaSeekSet:function(e){d.requestMediaSeek(e)
},mediaPauseSet:function(e){d.requestMediaPause(e)
},mediaMuteSet:function(e){d.requestMediaMute(!d._muted)
},mediaSoundLevelSet:function(e){d.requestMediaSoundLevel(e)
}};
this._noop=new $pdk.plugin.vpaid.player.PdkNoopPlayer(this._controller,c)
},requestMediaClose:function(){this._controller.trace("requestMediaClose: calling stopAd","VPAID",tpConsts.INFO);
this._adWrapper.stopAd()
},requestMediaEnd:function(){this._controller.trace("requestMediaEnd: calling stopAd","VPAID",tpConsts.INFO);
this._adWrapper.stopAd()
},requestMediaSeekSet:function(a){return
},requestMediaPause:function(a){if(a){this._adWrapper.pauseAd()
}else{this._adWrapper.resumeAd()
}},requestMediaMute:function(b){if(this._ignoreMute){return
}setTimeout(function(){a._ignoreMute=false
},500);
this._ignoreMute=true;
this._muted=b;
var a=this;
if(b){this._volume=0;
this._preMuteVolume=this._adWrapper.getAdVolume();
if(this._preMuteVolume<0){this._preMuteVolume=1
}if(this._adWrapper){this._adWrapper.setAdVolume(0)
}}else{this._volume=this._preMuteVolume;
if(this._adWrapper){this._adWrapper.setAdVolume(this._preMuteVolume)
}}},requestMediaSoundLevel:function(a){this._volume=a;
this._adWrapper.setAdVolume(a)
},destroy:function(){return
},isVPAIDAd:function(b){var a=false;
if((b.type=="application/x-shockwave-flash"||b.type=="swf")||(this._clip&&this._clip.baseClip.URL==b.URL)){a=true
}else{if((b.type=="application/javascript"||b.type=="js")||(this._clip&&this._clip.baseClip.URL==b.URL)){a=true
}else{a=false
}}this._controller.trace("is this a VPAID ad? ["+b.type+": "+a+"]","VPAID",tpConsts.INFO);
return a
},initVPAIDAd:function(a){if(this.isVPAIDAd(a.baseClip)&&a.streamType!=tpConsts.StreamType.EMPTY){this._clip=a;
this._adStopped=false;
this.loadAd();
this._controller.trace("loading the VPAID ad","VPAID",tpConsts.INFO);
if(a.baseClip.isOverlay){this._controller.trace("VPAID came from a NonLinear VAST element, skipping until injectPlaylist","VPAID",tpConsts.INFO);
a.baseClip.URL="";
a.streamType="empty";
this._controller.modClip(a);
this._linearPending=true;
return false
}else{a.streamType="empty";
this._controller.modClip(a);
this._controller.trace("Signing up to play this ad","VPAID",tpConsts.INFO);
this._adLoading=true;
return false
}}return false
},start:function(){this._startCalled=true;
if(this._adLoaded){this.startAd()
}},loadAd:function(){this._controller.trace("loadAd","VPAID",tpConsts.INFO);
this.startErrorStage(this.LOAD);
var a=this;
if(!this._adWrapper){if(this._controller.component.videoengineruntime==="html5"){this._adWrapper=new $pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper(this._controller,this._container)
}else{this._adWrapper=new $pdk.plugin.vpaid.wrapper.FlashAdWrapper(this._controller)
}}this._adWrapper.loadAd(this._clip.baseClip.URL,function(){a.onLoaderCompleteHandler()
},function(b){a.onLoaderErrorHandler(b)
})
},onLoaderCompleteHandler:function(){this.endErrorStage(this.LOAD);
var a=this._adWrapper.handshakeVersion("2.0");
this._controller.trace("handshake version: "+a,"VPAID",tpConsts.INFO);
if(a===null){this._noop.mediaError("ad api has no handshake function; it's either not implemented correctly or implemented for a non-generalized framework that we don't understand");
return
}this.addVPaidHandlers();
this.doInitAd()
},onLoaderErrorHandler:function(a){this._noop.mediaError(a.toString())
},handleReleaseEnd:function(a){this.cleanUp()
},handleClearCurrentRelease:function(a){this._noop.deactivate();
this._loadStartChecked=false;
this.cleanUp()
},beginVPAID:function(){var b=this._clip;
var a=this;
if(!b.baseClip.isAd){return
}else{if(b.streamType!="empty"){}else{if(b.baseClip.URL.indexOf(this._clip.baseClip.URL)!==0){this._controller.trace("Empty stream type, but not from this plug-in; ignore","VPAID",tpConsts.INFO)
}else{if(this._adWrapper&&(this._adWrapper.getAdLinear()||this._adVideoStarting)){this._controller.trace("ad is linear, starting playback...","VPAID",tpConsts.INFO);
this._controller.trace("Opening NoOp Bridge","VPAID",tpConsts.INFO);
this._noop.activate(b);
this._loadStartChecked=true;
if(this._linearPending){this._linearPending=false;
setTimeout(function(){a.doStartAdVideo()
},1)
}this._controller.trace("URL is "+b.baseClip.URL+" handle it","VPAID",tpConsts.INFO);
this.playAd(b)
}else{this._controller.trace("ad is not linear, resuming content playback...","VPAID",tpConsts.INFO);
this._noop.activate(b);
this._loadStartChecked=true;
this._waitingForPossibleIndecisiveLinearAd=true;
setTimeout(function(){a._noop.mediaStarts(this._clip)
},1)
}}}}},handleShowFullScreen:function(b){var a=this._controller.getMediaArea();
if(a&&this._adWrapper){if(b.data){this._adWrapper.resizeAd(a.width,a.height,"fullscreen")
}else{this._adWrapper.resizeAd(a.width,a.height,"normal")
}}},handleMediaEnd:function(a){if(this._adWrapper&&this._adWrapper.adLinear&&this._adVideoStarted&&this._adWrapper.getAdRemainingTime()>=1){this._controller.trace("ending linear media from outside","VPAID",tpConsts.INFO);
this._adWrapper.stopAd()
}else{if(this._adWrapper&&this._adStarted&&!this._adVideoStarting&&!(a.data).isAd){this._controller.trace("ending ad and moving on to next chapter","VPAID",tpConsts.INFO)
}}},playAd:function(b){this._controller.trace("playAd","VPAID",tpConsts.INFO);
this._currentAd=b;
if(this._adWrapper.getAdRemainingTime()>0){var c=this._adWrapper.getAdRemainingTime()*1000;
this._currentAd.mediaLength=c;
this._currentAd.length=c;
this._useRemainingTime=true;
this._controller.modClip(b)
}else{this._useRemainingTime=false
}this._controller.trace("Playing ad "+b.baseClip.URL+" duration: "+this._currentAd.mediaLength,"VPAID",tpConsts.INFO);
var a=this;
this._position=0;
this._loadPercentage=0
},doInitAd:function(){var b=(this._clip.baseClip.trackingData?this._clip.baseClip.trackingData:null);
var a=this._controller.getMediaArea();
this.startErrorStage(this.INIT);
this._controller.trace("calling initAd("+a.width+", "+a.height+", normal, 300, "+b+", env)","VPAID",tpConsts.INFO);
this._adWrapper.initAd(a.width,a.height,"normal",300,b,null)
},doStartAdVideo:function(){this._controller.trace("Calling mediaStarts","VPAID",tpConsts.INFO);
this._noop.mediaStarts(this._clip);
this._adVideoStarted=true;
this._adVideoStarting=false;
this.startScrubberTimer()
},startAd:function(){this._controller.trace("calling startAd()","VPAID",tpConsts.INFO);
this._adLoading=false;
this._controller.trace("inserting VPAID ad. linear: "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this.takeOverClip(this._clip);
this.beginVPAID();
this.endErrorStage(this.INIT);
this.startErrorStage(this.START);
this._adWrapper.startAd()
},adStarted:function(){this.positionPlayer(this._controller.getMediaArea());
this.positionPlayer(this._controller.getMediaArea());
if(this._controller.getMuteState()){this._muted=true;
this._preMuteVolume=1;
this._adWrapper.setAdVolume(0)
}else{this._muted=false;
this._adWrapper.setAdVolume(this._volume)
}},scrubTick:function(){if(!this._currentAd){return
}if(this._useRemainingTime&&this._currentAd.mediaLength>0){this._position=this._currentAd.mediaLength-(this._adWrapper.getAdRemainingTime()*1000)+500
}else{this._position+=300
}if(this._currentAd.mediaLength>0&&this._position>=this._currentAd.mediaLength){this._controller.trace("Video portion of ad is done playing","VPAID",tpConsts.INFO)
}else{this._controller.trace("Calling mediaPlaying("+this._position+") timeRemaining:"+this._adWrapper.getAdRemainingTime(),"VPAID",tpConsts.DEBUG);
this._noop.mediaPlaying(this._position)
}},positionPlayer:function(a){this._controller.trace("Positioning player at ["+a.x+", "+a.y+"], "+a.width+"w x "+a.height+"h","VPAID",tpConsts.INFO);
this._adWrapper.resizeAd(a.width,a.height,"normal")
},linearComplete:function(a){this._controller.trace("linear portion of ad is complete. endMedia: "+a,"VPAID",tpConsts.DEBUG);
if(this._currentAd&&this._currentAd.mediaLength){this._noop.mediaPlaying(this._currentAd.mediaLength)
}if(a){this._loadStartChecked=false;
this._noop.mediaEnds();
this._noop.deactivate()
}this._adVideoComplete=true;
if(!this._adWrapper||!this._adWrapper.getAdExpanded()){this._controller.pause(false)
}if(this._scrubberTimer){this._controller.trace("removing scrubber timer","VPAID",tpConsts.DEBUG);
clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}},adComplete:function(){if((this._adVideoStarted||this._adVideoStarting)&&!this._adVideoComplete){this._noop.mediaError("The VPAID ad ended unexpectedly, moving on.")
}this.cleanUp()
},startErrorStage:function(a){this._errorStage=a;
var b=this;
switch(a){case this.LOAD:this._errorTimer=setTimeout(function(){b.loadError()
},this.LOAD_TIMEOUT);
break;
case this.INIT:this._errorTimer=setTimeout(function(){b.initError()
},this.INIT_TIMEOUT);
break;
case this.START:this._errorTimer=setTimeout(function(){b.startError()
},this.START_TIMEOUT);
break;
case this.RESUME:this._errorTimer=setTimeout(function(){b.resumeError()
},this.RESUME_TIMEOUT);
break
}},endErrorStage:function(a){this._errorStage=this.NONE;
clearTimeout(this._errorTimer)
},loadError:function(){this._noop.mediaError("The VPAID content failed to Load after ms:"+this.LOAD_TIMEOUT)
},initError:function(){this._noop.mediaError("The VPAID content failed to Init after ms:"+this.INIT_TIMEOUT)
},startError:function(){this._noop.mediaError("The VPAID content failed to Start after ms:"+this.START_TIMEOUT)
},resumeError:function(){this._noop.mediaError("The VPAID content failed to Resume after ms:"+this.RESUME_TIMEOUT)
},addVPaidHandlers:function(){if(!this._adWrapper){return
}var a=this;
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdClickThru,function(b){a.handleAdClickThru(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdError,function(b){a.handleAdError(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdExpandedChange,function(b){a.handleAdExpandedChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdImpression,function(b){a.handleAdImpression(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLinearChange,function(b){a.handleAdLinearChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLoaded,function(b){a.handleAdLoaded(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLog,function(b){a.handleAdLog(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPaused,function(b){a.handleAdPaused(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPlaying,function(b){a.handleAdPlaying(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdRemainingTimeChange,function(b){a.handleAdRemainingTimeChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStarted,function(b){a.handleAdStarted(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStopped,function(b){a.handleAdStopped(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserAcceptInvitation,function(b){a.handleAdUserAcceptInvitation(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserClose,function(b){a.handleAdUserClose(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserMinimize,function(b){a.handleAdUserMinimize(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoComplete,function(b){a.handleAdVideoComplete(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoFirstQuartile,function(b){a.handleAdVideoFirstQuartile(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoMidpoint,function(b){a.handleAdVideoMidpoint(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoStart,function(b){a.handleAdVideoStart(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoThirdQuartile,function(b){a.handleAdVideoThirdQuartile(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVolumeChange,function(b){a.handleAdVolumeChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdSkippableStateChange,function(b){a.handleAdSkippableStateChange(b)
})
},removeVPaidHandlers:function(){},linearCheck:function(){if(this._adVideoStarting||this._adVideoStarted){}else{this._controller.trace("closing out empty clip since no ad started.","VPAID",tpConsts.INFO);
this._loadStartChecked=false;
this._noop.mediaEnds();
this._noop.deactivate()
}},handleAdClickThru:function(b){var a=b.data;
this._controller.trace("handleAdClickThru "+(a?"url:"+a.url+" id:"+a.id+" playerHandles:"+a.playerHandles:"no data"),"VPAID",tpConsts.INFO);
if(a.playerHandles){if(a.url!==""){window.open(a.url,"_blank")
}else{window.open(this._clip.baseClip.moreInfo.href,"_blank")
}}},handleAdError:function(b){var a=(b&&b.message?b.message:"Unknown Error");
if(!this._loadStartChecked){this._noop.activate(this._clip)
}this._noop.mediaError("VPAID AdError: "+a);
this._noop.deactivate();
this._controller.trace("handleAdError :"+a,"VPAID",tpConsts.INFO)
},handleAdExpandedChange:function(a){this._controller.trace("handleAdExpandedChange expanded:"+this._adWrapper.getAdExpanded(),"VPAID",tpConsts.INFO);
if(this._adWrapper.getAdExpanded()){this._controller.pause(true)
}else{this._controller.pause(false)
}},handleAdImpression:function(a){this._controller.trace("handleAdImpression :","VPAID",tpConsts.INFO)
},handleAdLinearChange:function(a){this._controller.trace("handleAdLinearChange : "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
if(!this._adWrapper.getAdLinear()){this.linearComplete(true)
}},handleAdLoaded:function(a){this._controller.trace("handleAdLoaded: adLinear = "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this._adLoaded=true;
this._adLoading=false;
if(this._startCalled){this.startAd()
}},handleAdLog:function(a){this._controller.trace(a,"AdLog",tpConsts.INFO)
},handleAdPaused:function(a){this._controller.trace("handleAdPaused","VPAID",tpConsts.INFO);
this.stopScrubberTimer();
this._noop.mediaPause(true)
},handleAdPlaying:function(a){this._controller.trace("handleAdPlaying","VPAID",tpConsts.INFO);
this.endErrorStage(this.RESUME);
this._noop.mediaPause(false);
this.startScrubberTimer()
},handleAdRemainingTimeChange:function(a){this._controller.trace("handleAdRemainingTimeChange :"+this._adWrapper.getAdRemainingTime()+" time remaining:"+this._adWrapper.getAdRemainingTime(),"VPAID",tpConsts.INFO)
},handleAdStarted:function(c){this._controller.trace("handleAdStarted: adLinear = "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this.endErrorStage(this.START);
this.adStarted();
this._adStarted=true;
if(this._adWrapper.getAdRemainingTime()>0){var b=this._adWrapper.getAdRemainingTime()*1000;
this._currentAd.mediaLength=b;
this._currentAd.length=b;
this._useRemainingTime=true;
this._controller.modClip(clip)
}else{this._useRemainingTime=false
}if(this._waitingForPossibleIndecisiveLinearAd){var a=this;
setTimeout(function(){a.linearCheck()
},100)
}},handleAdStopped:function(a){this._controller.trace("handleAdStopped","VPAID",tpConsts.INFO);
if(!this._adVideoComplete&&(this._adVideoStarted||this._adVideoStarting)){this.linearComplete(false)
}this._adStopped=true;
this.adComplete()
},handleAdUserAcceptInvitation:function(a){this._controller.trace("handleAdUserAcceptInvitation","VPAID",tpConsts.INFO)
},handleAdUserClose:function(a){this._controller.trace("handleAdUserClose","VPAID",tpConsts.INFO)
},handleAdUserMinimize:function(a){this._controller.trace("handleAdUserMinimize :","VPAID",tpConsts.INFO)
},handleAdVideoComplete:function(a){this._controller.trace("handleAdVideoComplete :","VPAID",tpConsts.INFO);
this.linearComplete(true)
},handleAdVideoFirstQuartile:function(a){this._controller.trace("handleAdVideoFirstQuartile :","VPAID",tpConsts.INFO)
},handleAdVideoMidpoint:function(a){this._controller.trace("handleAdVideoMidpoint","VPAID",tpConsts.INFO)
},handleAdVideoStart:function(b){this._controller.trace("handleAdVideoStart","VPAID",tpConsts.INFO);
if(this._waitingForPossibleIndecisiveLinearAd){this._waitingForPossibleIndecisiveLinearAd=false;
this._adLoading=false;
this._adVideoStarting=true;
this._controller.trace("inserting VPAID ad. linear: "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this.takeOverClip(this._clip);
this.beginVPAID();
var a=this;
setTimeout(function(){a.doStartAdVideo()
},1)
}else{if(this._linearPending){this._adVideoStarting=true;
this._controller.trace("handleAdVideoStart: injecting","VPAID",tpConsts.INFO);
this._controller.injectPlaylist(this.createPlaylist(this.getNoOpClip(this._clip.baseClip)))
}else{this._controller.trace("handleAdVideoStart: starting","VPAID",tpConsts.INFO);
this.doStartAdVideo()
}}},handleAdVolumeChange:function(a){this._ignoreMute=false
},handleAdSkippableStateChange:function(a){this._clip.baseClip.noSkip=!this._adWrapper.getAdSkippableState();
this._controller.updateClip(this._clip)
},startScrubberTimer:function(){if(!this._scrubberTimer){var a=this;
this._scrubberTimer=setInterval(function(){a.scrubTick()
},300)
}},stopScrubberTimer:function(){if(this._scrubberTimer){clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}},getNoOpClip:function(c){var b={};
b.globalDataType="com.theplatform.pdk.data::BaseClip";
b.title="";
b.URL=c.URL;
b.isAd=true;
b.noSkip=true;
b.releaseLength=c.releaseLength;
b.impressionUrls=c.impressionUrls;
b.type="application/x-shockwave-flash";
var a=com.theplatform.pdk.SelectorExported.getInstance(this._controller.scopes.toString()).parseClip(b);
a.streamType="empty";
a.title="";
a.hasOverlayLayer=true;
a.trackingURLs=this._clip.trackingURLs;
return a
},takeOverClip:function(a){var b=a.baseClip;
b.globalDataType="com.theplatform.pdk.data::BaseClip";
b.isAd=true;
b.noSkip=true;
b.title="";
b.type="application/x-shockwave-flash";
this._controller.modBaseClip(a);
a.title="";
a.streamType="empty";
a.isExternal=true;
a.hasOverlayLayer=true;
this._controller.modClip(a)
},createPlaylist:function(a){var b={};
b.globalDataType="com.theplatform.pdk.data::Playlist";
b.baseClips=[a.baseClip];
b.clips=[a];
return b
},cleanUp:function(){if(!this._clip){return
}this._controller.trace("cleanUp()","VPAID",tpConsts.INFO);
this._clip=null;
if(this._adWrapper){this.removeVPaidHandlers();
if(!this._adStopped){this._controller.trace("calling stopAd()","VPAID",tpConsts.INFO);
this._adWrapper.stopAd()
}}if(this._loadStartChecked){this._loadStartChecked=false;
this._noop.mediaEnds();
this._noop.deactivate()
}if(this._scrubberTimer){this._controller.trace("removing scrubber timer","VPAID",tpConsts.DEBUG);
clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}this._linearPending=false;
this._waitingForPossibleIndecisiveLinearAd=false;
this._adStarted=false;
this._adStopped=false;
this._adLoaded=false;
this._adLoading=false;
this._startCalled=false;
this._adVideoStarted=false;
this._adVideoStarting=false;
this._adVideoComplete=false;
this._adWrapper=null;
this._scrubberTimer=null;
this._soundLevel=null;
this._muted=false;
this._position=0;
this._currentAd=null;
this._clip=null;
this._loadPercentage=0;
this._useRemainingTime=false;
this._linearPending=false;
this._loadStartChecked=false;
this._waitingForPossibleIndecisiveLinearAd=false;
this._injectionPending=false;
this._adVideoStarted=false;
this._adVideoStarting=false;
this._adVideoComplete=false;
this._adStarted=false;
this._adStopped=false;
this._adLoading=false;
this._adLoaded=false;
this._adWrapper=null;
this._errorTimer=null;
this._errorStage=this.NONE;
this._startCalled=false
}});
$pdk.ns("$pdk.plugin.vpaid.wrapper");
$pdk.plugin.vpaid.wrapper.nsapiComponentMap={};
$pdk.plugin.vpaid.wrapper.nsapiMessageDelegate=function(b,c,d,a){if($pdk.plugin.vpaid.wrapper.nsapiComponentMap[a]){$pdk.plugin.vpaid.wrapper.nsapiComponentMap[a].receiveMessage(b,c,d)
}};
$pdk.plugin.vpaid.wrapper.FlashAdWrapper=$pdk.extend(function(){},{constructor:function(a){this.controller=a;
this.listeners=[];
$pdk.plugin.vpaid.wrapper.nsapiComponentMap[a.id]=this;
this.controller.loadLayer("flash",$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_URL)
},receiveMessage:function(a,b,c){if(a==="event"){this.dispatchEvent(b,c)
}else{if(a==="load"&&b==="success"){this.loadSuccess()
}else{if(a==="load"&&b==="failure"){this.loadFailure()
}}}},dispatchEvent:function(b,c){if(this.listeners[b]){for(var a=0;
a<this.listeners[b].length;
a++){this.listeners[b][a](c)
}}},loadAd:function(b,c,a){this.loadSuccess=c;
this.loadFailure=a;
this.listeners=[];
this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"loadAd",[b,"$pdk.plugin.vpaid.wrapper.nsapiMessageDelegate",this.controller.id])
},addEventListener:function(a,b){if(!this.listeners[a]){this.listeners[a]=[]
}this.listeners[a].push(b)
},getAdLinear:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdLinear",[])
},getAdExpanded:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdExpanded",[])
},getAdRemainingTime:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdRemainingTime",[])
},getAdVolume:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdVolume",[])
},setAdVolume:function(a){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"setAdVolume",[a])
},handshakeVersion:function(a){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"handshakeVersion",[a])
},initAd:function(d,a,b,c,f,e){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"initAd",[d,a,b,c,f,e])
},resizeAd:function(c,a,b){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"resizeAd",[c,a,b])
},startAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"startAd",[])
},stopAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"stopAd",[])
},pauseAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"pauseAd",[])
},resumeAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"resumeAd",[])
},expandAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"expandAd",[])
},collapseAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"collapseAd",[])
}});
$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID="vpaid-layer";
$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_URL=$pdk.scriptRoot+"/swf/VPAIDLoader.swf";
$pdk.ns("$pdk.plugin.vpaid.wrapper");
$pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper=$pdk.extend(function(){},{LAYER_LOADED:false,constructor:function(b,a){this.controller=b;
this.iframe=document.createElement("iframe");
this.iframe.style.visibility="hidden";
this.iframe.style.position="absolute";
this.iframe.style.top="-10000px";
a.appendChild(this.iframe);
this.container=a;
if(!$pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper.LAYER_LOADED){$pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper.LAYER_LOADED=true
}},loadAd:function(b,e,a){var d=this;
this.iframe.onload=function(g){var f=d.iframe.contentWindow.getVPAIDAd;
if(f&&typeof f=="function"){d.VPAIDCreative=f();
if(d.checkVPAIDInterface(d.VPAIDCreative)){e()
}else{a()
}}};
var c='<html><head><script type="text/javascript" src="'+b+'"><\/script></head><body></body></html>';
if(this.iframe.contentWindow){this.iframe.contentWindow.document.open();
this.iframe.contentWindow.document.write(c);
this.iframe.contentWindow.document.close()
}else{this.iframe.contentDocument.open();
this.iframe.contentDocument.write(c);
this.iframe.contentDocument.close()
}},checkVPAIDInterface:function(a){if(a.handshakeVersion&&typeof a.handshakeVersion=="function"&&a.initAd&&typeof a.initAd=="function"&&a.startAd&&typeof a.startAd=="function"&&a.stopAd&&typeof a.stopAd=="function"&&a.skipAd&&typeof a.skipAd=="function"&&a.resizeAd&&typeof a.resizeAd=="function"&&a.pauseAd&&typeof a.pauseAd=="function"&&a.resumeAd&&typeof a.resumeAd=="function"&&a.expandAd&&typeof a.expandAd=="function"&&a.collapseAd&&typeof a.collapseAd=="function"&&a.subscribe&&typeof a.subscribe=="function"&&a.unsubscribe&&typeof a.unsubscribe=="function"){return true
}return false
},subscribe:function(b,a){this.VPAIDCreative.subscribe(b,a)
},unsubscribe:function(b,a){this.VPAIDCreative.unsubscribe(b,a)
},addEventListener:function(a,b){this.subscribe(b,a)
},removeEventListener:function(a,b){this.unsubscribe(b,a)
},getAdLinear:function(){try{return this.VPAIDCreative.getAdLinear()
}catch(a){return true
}},getAdExpanded:function(){try{return this.VPAIDCreative.getAdExpanded()
}catch(a){return false
}},getAdRemainingTime:function(){try{return this.VPAIDCreative.getAdRemainingTime()
}catch(a){return -1
}},getAdVolume:function(){try{return this.VPAIDCreative.getAdVolume()
}catch(a){return -1
}},setAdVolume:function(a){try{this.VPAIDCreative.setAdVolume(a)
}catch(b){}},getAdSkippableState:function(){try{return this.VPAIDCreative.getAdSkippableState()
}catch(a){return false
}},handshakeVersion:function(a){return this.VPAIDCreative.handshakeVersion(a)
},initAd:function(d,a,b,c,f,e){if(!e){e={slot:this.container,videoSlot:this.controller.getVideoProxy(),videoSlotCanAutoPlay:true}
}this.VPAIDCreative.initAd(d,a,b,c,f,e)
},resizeAd:function(c,a,b){this.VPAIDCreative.resizeAd(c,a,b)
},startAd:function(){this.VPAIDCreative.startAd()
},stopAd:function(){this.VPAIDCreative.stopAd()
},pauseAd:function(){this.VPAIDCreative.pauseAd()
},resumeAd:function(){this.VPAIDCreative.resumeAd()
},expandAd:function(){this.VPAIDCreative.expandAd()
},collapseAd:function(){this.VPAIDCreative.collapseAd()
}});