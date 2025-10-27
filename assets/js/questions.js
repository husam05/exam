const QUESTION_TIME_LIMITS = {
    mcq: 20,
    truefalse: 15,
    short: 90,
    essay: 240,
    practical: 120
};

const questions = [
    {
        id: 1,
        lecture: 1,
        type: "mcq",
        prompt: "When was Linux developed, and who created it?",
        options: [
            { key: "A", text: "1985 by Richard Stallman" },
            { key: "B", text: "1991 by Linus Torvalds" },
            { key: "C", text: "1995 by Bill Gates" },
            { key: "D", text: "2000 by Steve Jobs" }
        ],
        correctAnswer: "B"
    },
    {
        id: 2,
        lecture: 1,
        type: "mcq",
        prompt: "What percentage of servers on the internet run on Linux?",
        options: [
            { key: "A", text: "Over 50%" },
            { key: "B", text: "Over 70%" },
            { key: "C", text: "Over 90%" },
            { key: "D", text: "100%" }
        ],
        correctAnswer: "C"
    },
    {
        id: 3,
        lecture: 1,
        type: "mcq",
        prompt: "Which Linux distribution is considered ideal for beginners?",
        options: [
            { key: "A", text: "Fedora" },
            { key: "B", text: "Debian" },
            { key: "C", text: "Ubuntu" },
            { key: "D", text: "Kali Linux" }
        ],
        correctAnswer: "C"
    },
    {
        id: 4,
        lecture: 1,
        type: "mcq",
        prompt: "Which Linux distribution is specifically aimed at security testing and ethical hacking?",
        options: [
            { key: "A", text: "Ubuntu" },
            { key: "B", text: "Fedora" },
            { key: "C", text: "Debian" },
            { key: "D", text: "Kali Linux" }
        ],
        correctAnswer: "D"
    },
    {
        id: 5,
        lecture: 1,
        type: "mcq",
        prompt: "What is the most commonly used file system in modern Linux distributions?",
        options: [
            { key: "A", text: "FAT32" },
            { key: "B", text: "NTFS" },
            { key: "C", text: "ext4" },
            { key: "D", text: "APFS" }
        ],
        correctAnswer: "C"
    },
    {
        id: 6,
        lecture: 1,
        type: "truefalse",
        prompt: "Linux is based on the philosophy of open-source software, allowing users to view, modify, and freely distribute the source code.",
        correctAnswer: true
    },
    {
        id: 7,
        lecture: 1,
        type: "truefalse",
        prompt: "Fedora is known for its stability and long-term support.",
        correctAnswer: false,
        explanation: "Debian is recognized for stability; Fedora targets cutting-edge features."
    },
    {
        id: 8,
        lecture: 1,
        type: "truefalse",
        prompt: "Linux requires frequent reboots to maintain stability.",
        correctAnswer: false
    },
    {
        id: 9,
        lecture: 1,
        type: "truefalse",
        prompt: "The root partition (/) contains the core system files in Linux.",
        correctAnswer: true
    },
    {
        id: 10,
        lecture: 1,
        type: "truefalse",
        prompt: "The swap partition acts as virtual memory to assist the system when RAM runs low.",
        correctAnswer: true
    },
    {
        id: 11,
        lecture: 1,
        type: "short",
        prompt: "List three main partitions typically created during Linux installation and explain their purposes.",
        referenceAnswer: "Root partition (/) for core system files; Home partition (/home) for personal user files; Swap partition for overflow virtual memory support."
    },
    {
        id: 12,
        lecture: 1,
        type: "short",
        prompt: "What are three key advantages that make Linux stand out compared to other operating systems?",
        referenceAnswer: "Stability with long uptimes; high security through strict permissions; efficient resource usage even on low-spec hardware."
    },
    {
        id: 13,
        lecture: 1,
        type: "short",
        prompt: "Name three fields where Linux is widely used.",
        referenceAnswer: "Server infrastructure; cloud platforms such as AWS and Google Cloud; supercomputing and big data centers."
    },
    {
        id: 14,
        lecture: 2,
        type: "mcq",
        prompt: "What is an inode in a Linux filesystem?",
        options: [
            { key: "A", text: "A data storage unit on disks" },
            { key: "B", text: "A part of the filesystem containing information about files" },
            { key: "C", text: "A type of file extension" },
            { key: "D", text: "A network protocol" }
        ],
        correctAnswer: "B"
    },
    {
        id: 15,
        lecture: 2,
        type: "mcq",
        prompt: "Which filesystem is most common in Linux systems?",
        options: [
            { key: "A", text: "FAT32" },
            { key: "B", text: "NTFS" },
            { key: "C", text: "EXT4" },
            { key: "D", text: "APFS" }
        ],
        correctAnswer: "C"
    },
    {
        id: 16,
        lecture: 2,
        type: "mcq",
        prompt: "What is the maximum file size limitation in FAT32?",
        options: [
            { key: "A", text: "2GB" },
            { key: "B", text: "4GB" },
            { key: "C", text: "8GB" },
            { key: "D", text: "No limit" }
        ],
        correctAnswer: "B"
    },
    {
        id: 17,
        lecture: 2,
        type: "mcq",
        prompt: "Which filesystem is used in macOS?",
        options: [
            { key: "A", text: "NTFS" },
            { key: "B", text: "EXT4" },
            { key: "C", text: "APFS" },
            { key: "D", text: "FAT32" }
        ],
        correctAnswer: "C"
    },
    {
        id: 18,
        lecture: 2,
        type: "mcq",
        prompt: "In Unix and Linux systems, what represents the root of all files and folders?",
        options: [
            { key: "A", text: "C:/" },
            { key: "B", text: "/" },
            { key: "C", text: "~" },
            { key: "D", text: "root/" }
        ],
        correctAnswer: "B"
    },
    {
        id: 19,
        lecture: 2,
        type: "truefalse",
        prompt: "Blocks are data storage units on disks that contain portions of data.",
        correctAnswer: true
    },
    {
        id: 20,
        lecture: 2,
        type: "truefalse",
        prompt: "NTFS is the filesystem used in modern Windows systems and offers features like security and permissions management.",
        correctAnswer: true
    },
    {
        id: 21,
        lecture: 2,
        type: "truefalse",
        prompt: "The filesystem has no role in data security.",
        correctAnswer: false,
        explanation: "Filesystem permissions are a foundational security control."
    },
    {
        id: 22,
        lecture: 2,
        type: "truefalse",
        prompt: "A path can be either absolute or relative.",
        correctAnswer: true
    },
    {
        id: 23,
        lecture: 2,
        type: "short",
        prompt: "List and explain the four main functions of a filesystem.",
        referenceAnswer: "Storage for organizing data; retrieval for locating files; naming conventions; structural hierarchy for accessibility."
    },
    {
        id: 24,
        lecture: 2,
        type: "short",
        prompt: "What are the four key components of a filesystem?",
        referenceAnswer: "Blocks that store data; inodes describing files; paths providing addressing; files and folders holding data and directories."
    },
    {
        id: 25,
        lecture: 2,
        type: "short",
        prompt: "Explain the two main operations performed on files in a filesystem.",
        referenceAnswer: "Creating files allocates space and updates inodes; reading files resolves the path, locates the inode, and loads data blocks."
    },
    {
        id: 26,
        lecture: 3,
        type: "mcq",
        prompt: "Which file stores basic information about each user in Linux?",
        options: [
            { key: "A", text: "/etc/shadow" },
            { key: "B", text: "/etc/passwd" },
            { key: "C", text: "/etc/group" },
            { key: "D", text: "/etc/users" }
        ],
        correctAnswer: "B"
    },
    {
        id: 27,
        lecture: 3,
        type: "mcq",
        prompt: "Where are user passwords stored in encrypted format?",
        options: [
            { key: "A", text: "/etc/passwd" },
            { key: "B", text: "/etc/users" },
            { key: "C", text: "/etc/shadow" },
            { key: "D", text: "/home/passwords" }
        ],
        correctAnswer: "C"
    },
    {
        id: 28,
        lecture: 3,
        type: "mcq",
        prompt: "What is the default location for user home directories in Linux?",
        options: [
            { key: "A", text: "/root/username" },
            { key: "B", text: "/home/username" },
            { key: "C", text: "/usr/username" },
            { key: "D", text: "/var/username" }
        ],
        correctAnswer: "B"
    },
    {
        id: 29,
        lecture: 3,
        type: "mcq",
        prompt: "Which directory contains default files that are copied to a new user's home directory?",
        options: [
            { key: "A", text: "/etc/default" },
            { key: "B", text: "/etc/skel" },
            { key: "C", text: "/usr/template" },
            { key: "D", text: "/home/template" }
        ],
        correctAnswer: "B"
    },
    {
        id: 30,
        lecture: 3,
        type: "mcq",
        prompt: "What does the '-m' flag do in the 'useradd' command?",
        options: [
            { key: "A", text: "Sets the user as administrator" },
            { key: "B", text: "Creates a mail account" },
            { key: "C", text: "Ensures that the home directory is created" },
            { key: "D", text: "Sets a default password" }
        ],
        correctAnswer: "C"
    },
    {
        id: 31,
        lecture: 3,
        type: "truefalse",
        prompt: "User management is important for system security by controlling who has access and what permissions they have.",
        correctAnswer: true
    },
    {
        id: 32,
        lecture: 3,
        type: "truefalse",
        prompt: "When a new user is created, they are typically added to a group with the same name as their username.",
        correctAnswer: true
    },
    {
        id: 33,
        lecture: 3,
        type: "truefalse",
        prompt: "The default shell for new users is always /bin/sh.",
        correctAnswer: false,
        explanation: "Most distributions default to /bin/bash or /bin/zsh."
    },
    {
        id: 34,
        lecture: 3,
        type: "truefalse",
        prompt: "User management allows for tracking the activities of each user on the system.",
        correctAnswer: true
    },
    {
        id: 35,
        lecture: 3,
        type: "truefalse",
        prompt: "All users on a Linux system share the same home directory.",
        correctAnswer: false
    },
    {
        id: 36,
        lecture: 3,
        type: "short",
        prompt: "List five reasons why user management is important in Linux.",
        referenceAnswer: "Security control; resource allocation; user privacy; organizational efficiency; auditing and monitoring."
    },
    {
        id: 37,
        lecture: 3,
        type: "short",
        prompt: "Describe what happens when a new user is created in a Linux system (list at least 5 steps).",
        referenceAnswer: "Creates /etc/passwd entry; provisions /home directory; copies defaults from /etc/skel; assigns secure permissions; stores encrypted password in /etc/shadow; creates matching primary group; assigns default shell."
    },
    {
        id: 38,
        lecture: 3,
        type: "short",
        prompt: "Explain the difference between the 'adduser' and 'useradd' commands.",
        referenceAnswer: "adduser is interactive and prompts for details; useradd is low-level and needs flags such as -m for home and -s for shell."
    },
    {
        id: 39,
        lecture: 3,
        type: "short",
        prompt: "What information is stored in the /etc/passwd file for each user?",
        referenceAnswer: "Username, UID, primary GID, home directory path, and default shell metadata."
    },
    {
        id: 40,
        lecture: 3,
        type: "short",
        prompt: "How does user management facilitate collaboration and sharing in Linux?",
        referenceAnswer: "File permissions and group assignments allow controlled read, write, and modify access for collaborative work."
    },
    {
        id: 41,
        lecture: 1,
        type: "essay",
        prompt: "Discuss the philosophy of open-source software in Linux and how it contributes to the system's development and security.",
        referenceAnswer: "Highlight transparency, community collaboration, rapid bug discovery, peer-reviewed security, and freedom to modify and redistribute."
    },
    {
        id: 42,
        lecture: 1,
        type: "essay",
        prompt: "Compare and contrast three different Linux distributions (Ubuntu, Fedora, and Debian) in terms of their target users and key features.",
        referenceAnswer: "Ubuntu for beginners with broad support; Fedora for developers wanting latest tech; Debian for stability and LTS foundations."
    },
    {
        id: 43,
        lecture: 2,
        type: "essay",
        prompt: "Explain the importance of the filesystem hierarchy in Linux and describe the tree structure starting from the root directory.",
        referenceAnswer: "Cover root '/', branching directories, predictable locations for binaries, configs, user data, and how hierarchy aids system organization."
    },
    {
        id: 44,
        lecture: 3,
        type: "essay",
        prompt: "Analyze the role of user management in maintaining system security, resource allocation, and privacy in a multi-user Linux environment.",
        referenceAnswer: "Detail permission boundaries, quotas, role-based access, auditing, and safeguarding personal data."
    },
    {
        id: 45,
        lecture: 1,
        type: "essay",
        prompt: "Describe the complete process of installing Linux, including partitioning, formatting, and post-installation setup. Include details about hardware and driver management.",
        referenceAnswer: "Explain partition planning, ext4 formatting, guided installers, dual-boot choices, driver detection, and post-install configuration."
    },
    {
        id: 46,
        lecture: 3,
        type: "practical",
        prompt: "Write the command to create a new user named \"john\" with a home directory and /bin/bash as the default shell.",
        referenceAnswer: "sudo useradd -m -s /bin/bash john"
    },
    {
        id: 47,
        lecture: 3,
        type: "practical",
        prompt: "Write the command to set a password for the user \"john\".",
        referenceAnswer: "sudo passwd john"
    },
    {
        id: 48,
        lecture: 3,
        type: "practical",
        prompt: "What command would you use to create a user interactively with prompts for additional information?",
        referenceAnswer: "sudo adduser username"
    },
    {
        id: 49,
        lecture: 3,
        type: "practical",
        prompt: "Explain what each part of the following command does: sudo useradd -m -s /bin/zsh jane.",
        referenceAnswer: "sudo elevates privileges; useradd invokes account creation; -m creates home directory; -s /bin/zsh sets the shell; jane is the username."
    },
    {
        id: 50,
        lecture: 1,
        type: "practical",
        prompt: "If you need to format a partition with the ext4 filesystem during Linux installation, what would be the general approach?",
        referenceAnswer: "Select the target partition, choose ext4 as the filesystem, assign the mount point such as / or /home, and confirm formatting in the installer."
    }
].map(question => ({
    ...question,
    timeLimit: question.timeLimit || QUESTION_TIME_LIMITS[question.type] || 60
}));
