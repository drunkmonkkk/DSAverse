import type { Language } from "@/lib/types";
export const arrayExamples: Record<Language, string> = {
  Python: `values = [3, 8, 2]\nvalues.append(5)\nvalues[0] = 7\nvalues.pop(1)\nprint(2 in values)\nfor value in values:\n    print(value)`,
  JavaScript: `const values = [3, 8, 2];\nvalues.push(5);\nvalues[0] = 7;\nvalues.splice(1, 1);\nconsole.log(values.includes(2));\nfor (const value of values) console.log(value);`,
  TypeScript: `const values: number[] = [3, 8, 2];\nvalues.push(5);\nvalues[0] = 7;\nvalues.splice(1, 1);\nconsole.log(values.includes(2));\nfor (const value of values) console.log(value);`,
  Java: `import java.util.*;\nclass Main { public static void main(String[] args) {\n var values = new ArrayList<>(List.of(3, 8, 2));\n values.add(5); values.set(0, 7); values.remove(1);\n System.out.println(values.contains(2));\n for(int value:values) System.out.println(value);\n}}`,
  "C++": `#include <vector>\n#include <algorithm>\n#include <iostream>\nint main(){\n std::vector<int> values{3,8,2};\n values.push_back(5); values[0]=7; values.erase(values.begin()+1);\n std::cout<<(std::find(values.begin(),values.end(),2)!=values.end())<<'\\n';\n for(int value:values) std::cout<<value<<'\\n';\n}`,
  C: `#include <stdio.h>\nint main(void){\n int values[8]={3,8,2},size=3;\n if(size<8)values[size++]=5;\n values[0]=7;\n for(int i=1;i+1<size;i++)values[i]=values[i+1];\n size--;\n for(int i=0;i<size;i++)printf("%d\\n",values[i]);\n return 0;\n}`,
};
export const searchExamples: Record<Language, string> = {
  Python: `def search(a, target):\n    left, right = 0, len(a)-1\n    while left <= right:\n        mid = left + (right-left)//2\n        if a[mid] == target: return mid\n        if a[mid] < target: left = mid+1\n        else: right = mid-1\n    return -1\nprint(search([1,3,7,9],7))`,
  JavaScript: `function search(a, target) {\n let left=0,right=a.length-1;\n while(left<=right){\n  const mid=left+Math.floor((right-left)/2);\n  if(a[mid]===target)return mid;\n  if(a[mid]<target)left=mid+1;else right=mid-1;\n }\n return -1;\n}\nconsole.log(search([1,3,7,9],7));`,
  TypeScript: `function search(a:number[],target:number):number {\n let left=0,right=a.length-1;\n while(left<=right){\n  const mid=left+Math.floor((right-left)/2);\n  if(a[mid]===target)return mid;\n  if(a[mid]<target)left=mid+1;else right=mid-1;\n }\n return -1;\n}\nconsole.log(search([1,3,7,9],7));`,
  Java: `class Main {\n static int search(int[] a,int target){\n  int l=0,r=a.length-1;\n  while(l<=r){int m=l+(r-l)/2;\n   if(a[m]==target)return m;\n   if(a[m]<target)l=m+1;else r=m-1;\n  }return -1;\n }\n public static void main(String[] args){System.out.println(search(new int[]{1,3,7,9},7));}\n}`,
  "C++": `#include <vector>\n#include <iostream>\nint search(const std::vector<int>& a,int target){\n int l=0,r=static_cast<int>(a.size())-1;\n while(l<=r){int m=l+(r-l)/2;\n  if(a[m]==target)return m;\n  if(a[m]<target)l=m+1;else r=m-1;\n }return -1;\n}\nint main(){std::cout<<search({1,3,7,9},7)<<'\\n';}`,
  C: `#include <stdio.h>\nint search(const int *a,int n,int target){\n int l=0,r=n-1;\n while(l<=r){int m=l+(r-l)/2;\n  if(a[m]==target)return m;\n  if(a[m]<target)l=m+1;else r=m-1;\n }return -1;\n}\nint main(void){int a[]={1,3,7,9};printf("%d\\n",search(a,4,7));return 0;}`,
};
export function codeFor(slug: string) {
  return slug.includes("binary-search") ? searchExamples : arrayExamples;
}
