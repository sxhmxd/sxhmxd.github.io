---
title: git 命令
---

## 专有名词

```
Workspance: 工作区
Index / Stage: 暂存区
Repository: 仓库区(本地仓库)
Remote: 远程仓库

```

![git专有名词](https://upload-images.jianshu.io/upload_images/18087435-2b52aaf65be47442.jpg)

## 创建本地代码库

```
// 初始化一个git 代码库

git init

// 新建一个目录，将其初始化为Git代码库。

git init [project-name]

// 下载一个项目到本地

git clone

```

## 配置

git 的设置文件为.gitconfig,它可以在用户主目录下(全局配置)，也可以在项目目录下(项目配置)。

可以配置忽略文件，

## 增加/删除文件

```
// 添加指定文件到暂存区
git add [file1] ...

// 添加指定目录到暂存区
git add 文件夹名

// 添加当前目录的所有文件到暂存区
git add .

// 删除工作区文件夹，并且将这次删除放入暂存区
git rm 文件名
```

## 代码提交

```
// 提交暂存区到仓库区
git commit -m '填写提交的信息'

// 提交指定的文件到仓库区
git commit 文件名 -m '填写提交的信息'

```

## 分支

```
// 列出所有的本地分支
git branch

// 列出所有远程分支
git branch -r

// 列出所有本地分支和远程分支
git branch -a

// 新建一个分支，但依然停留在当前分支
git branch  分支名

// 新建一个分支，并切换到该分支
git checkout -b 分支名

// 切换到指定的分支，并更新工作区
git checkout 要切换的分支名

// 合并分支到当前分支
git merge 要合并的分支名

// 删除分支
git branch -d 要删除的分支名

// 删除远程分支名
git branch -dr 要删除的远程分支名

```

## 查看信息

```
// 显示所有变更的文件
git status

// 显示当前分支的版本历史
git log

// 显示 commit 历史，以及每次commit发生变更的文件
git log --stat

// 显示暂存区和工作区的代码差异
git diff

```

## 远程同步

```
// 更新远程仓库
git remote update

// 下载远程仓库的所有变动
git fetch

// 显示所有远程仓库
git remote -v

// 取回远程仓库的变化，并于本地分支合并
git pull 远程仓库名 远程仓库的分支名

// 上传本地指定分支到远程仓库
git push 远程仓库名 远程仓库的分支名

// 强行推送当前分支到远程仓库，即使有冲突
git push 远程仓库名 -- force

// 推送所有分支到远程仓库
git push 远程仓库名 --all

```

## 撤销

```
//  恢复暂存区的指定文件到工作区
git checkout [file]

// 恢复某个commit的指定文件到暂存区和工作区
git checkout [commit] [file]

// 恢复暂存区的所有文件到工作区
git checkout .

// 重置暂存区的指定文件，与上一次commit保持一致，但工作区不变
git reset [file]

// 重置暂存区与工作区，与上一次commit保持一致
git reset --hard

// 重置当前分支的指针为指定commit，同时重置暂存区，但工作区不变
git reset [commit]

// 重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
git reset --hard [commit]

// 重置当前HEAD为指定commit，但保持暂存区和工作区不变
git reset --keep [commit]

// 新建一个commit，用来撤销指定commit
// 后者的所有变化都将被前者抵消，并且应用到当前分支
git revert [commit]

// 暂时将未提交的变化移除，稍后再移入
git stash
git stash pop

```
