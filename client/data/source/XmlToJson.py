# -*- coding: UTF-8 -*-  
import json  
 
from xml.etree import ElementTree as et;
import json

#=====================================================================================
outPath="../"
inFile="Footman.xml";
outFile=outPath+"DataFootman.js";
iteratorName="Footman";
keyName="Name";


f=open(outFile,'w',encoding="utf8");
f.write("");
f.close()

#print('read node from xmlfile, transfer them to json, and save into jsonFile:')
root=et.parse(inFile);
f=open(outFile,'a',encoding="utf8");
f.write("module.exports=\n");
f.write("{\n");

tempDict={};
for each in root.getiterator(iteratorName): 
	f.write("	\"");
	f.write(each.attrib[keyName]);
	f.write("\" : \n	");
	f.write(str(each.attrib));
	f.write(",\n");
    #tempDict[each.attrib[keyName]]=each.attrib    
    
#tempJson=json.dumps(tempDict,ensure_ascii=False)
#f.write(tempJson);
#print(tempJson)
f.write("}\n");
f.close()

#=====================================================================================
