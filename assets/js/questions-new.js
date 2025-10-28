const questions = [
    // Multiple Choice Questions
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
        correctAnswer: "B",
        explanation: "Linux was developed in 1991 by Linus Torvalds as an open-source alternative to Unix."
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
        correctAnswer: "C",
        explanation: "Over 90% of servers on the internet run on Linux due to its stability and security."
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
        correctAnswer: "C",
        explanation: "Ubuntu is considered ideal for beginners due to its ease of use and wide community support."
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
        correctAnswer: "D",
        explanation: "Kali Linux is specifically designed for security testing and ethical hacking with pre-installed security tools."
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
        correctAnswer: "C",
        explanation: "ext4 is the most commonly used file system in modern Linux distributions due to its reliability and performance."
    },
    {
        id: 6,
        lecture: 2,
        type: "mcq",
        prompt: "What is an inode in a Linux filesystem?",
        options: [
            { key: "A", text: "A data storage unit on disks" },
            { key: "B", text: "A part of the filesystem containing information about files" },
            { key: "C", text: "A type of file extension" },
            { key: "D", text: "A network protocol" }
        ],
        correctAnswer: "B",
        explanation: "An inode contains metadata about files such as permissions, timestamps, and data block locations."
    },
    {
        id: 7,
        lecture: 2,
        type: "mcq",
        prompt: "Which filesystem is most common in Linux systems?",
        options: [
            { key: "A", text: "FAT32" },
            { key: "B", text: "NTFS" },
            { key: "C", text: "EXT4" },
            { key: "D", text: "APFS" }
        ],
        correctAnswer: "C",
        explanation: "EXT4 is the most common filesystem in Linux systems, offering journaling and improved performance."
    },
    {
        id: 8,
        lecture: 2,
        type: "mcq",
        prompt: "What is the maximum file size limitation in FAT32?",
        options: [
            { key: "A", text: "2GB" },
            { key: "B", text: "4GB" },
            { key: "C", text: "8GB" },
            { key: "D", text: "No limit" }
        ],
        correctAnswer: "B",
        explanation: "FAT32 has a maximum file size limitation of 4GB per individual file."
    },
    {
        id: 9,
        lecture: 2,
        type: "mcq",
        prompt: "Which filesystem is used in macOS?",
        options: [
            { key: "A", text: "NTFS" },
            { key: "B", text: "EXT4" },
            { key: "C", text: "APFS" },
            { key: "D", text: "FAT32" }
        ],
        correctAnswer: "C",
        explanation: "APFS (Apple File System) is used in macOS, offering features like snapshots and encryption."
    },
    {
        id: 10,
        lecture: 2,
        type: "mcq",
        prompt: "In Unix and Linux systems, what represents the root of all files and folders?",
        options: [
            { key: "A", text: "C:\\" },
            { key: "B", text: "/" },
            { key: "C", text: "~" },
            { key: "D", text: "root/" }
        ],
        correctAnswer: "B",
        explanation: "The forward slash (/) represents the root directory in Unix and Linux systems."
    },
    {
        id: 11,
        lecture: 3,
        type: "mcq",
        prompt: "Which file stores basic information about each user in Linux?",
        options: [
            { key: "A", text: "/etc/shadow" },
            { key: "B", text: "/etc/passwd" },
            { key: "C", text: "/etc/group" },
            { key: "D", text: "/etc/users" }
        ],
        correctAnswer: "B",
        explanation: "/etc/passwd stores basic user information including username, UID, GID, home directory, and shell."
    },
    {
        id: 12,
        lecture: 3,
        type: "mcq",
        prompt: "Where are user passwords stored in encrypted format?",
        options: [
            { key: "A", text: "/etc/passwd" },
            { key: "B", text: "/etc/users" },
            { key: "C", text: "/etc/shadow" },
            { key: "D", text: "/home/passwords" }
        ],
        correctAnswer: "C",
        explanation: "/etc/shadow stores encrypted user passwords and related security information."
    },
    {
        id: 13,
        lecture: 3,
        type: "mcq",
        prompt: "What is the default location for user home directories in Linux?",
        options: [
            { key: "A", text: "/root/username" },
            { key: "B", text: "/home/username" },
            { key: "C", text: "/usr/username" },
            { key: "D", text: "/var/username" }
        ],
        correctAnswer: "B",
        explanation: "User home directories are typically located in /home/username in Linux systems."
    },
    {
        id: 14,
        lecture: 3,
        type: "mcq",
        prompt: "Which directory contains default files that are copied to a new user's home directory?",
        options: [
            { key: "A", text: "/etc/default" },
            { key: "B", text: "/etc/skel" },
            { key: "C", text: "/usr/template" },
            { key: "D", text: "/home/template" }
        ],
        correctAnswer: "B",
        explanation: "/etc/skel contains skeleton files that are copied to new user home directories during account creation."
    },
    {
        id: 15,
        lecture: 3,
        type: "mcq",
        prompt: "What does the '-m' flag do in the 'useradd' command?",
        options: [
            { key: "A", text: "Sets the user as administrator" },
            { key: "B", text: "Creates a mail account" },
            { key: "C", text: "Ensures that the home directory is created" },
            { key: "D", text: "Sets a default password" }
        ],
        correctAnswer: "C",
        explanation: "The -m flag in useradd ensures that the user's home directory is created automatically."
    },

    // True/False Questions
    {
        id: 16,
        lecture: 1,
        type: "truefalse",
        prompt: "Linux is based on the philosophy of open-source software, allowing users to view, modify, and freely distribute the source code.",
        correctAnswer: true,
        explanation: "True. Linux follows the open-source philosophy, allowing users full access to view, modify, and distribute the source code."
    },
    {
        id: 17,
        lecture: 1,
        type: "truefalse",
        prompt: "Fedora is known for its stability and long-term support.",
        correctAnswer: false,
        explanation: "False. Debian is known for stability and long-term support. Fedora focuses on cutting-edge features and latest technologies."
    },
    {
        id: 18,
        lecture: 1,
        type: "truefalse",
        prompt: "Linux requires frequent reboots to maintain stability.",
        correctAnswer: false,
        explanation: "False. Linux can run for extended periods without requiring a reboot, making it ideal for servers."
    },
    {
        id: 19,
        lecture: 1,
        type: "truefalse",
        prompt: "The root partition (/) contains the core system files in Linux.",
        correctAnswer: true,
        explanation: "True. The root partition (/) contains the core system files and serves as the base of the filesystem hierarchy."
    },
    {
        id: 20,
        lecture: 1,
        type: "truefalse",
        prompt: "The swap partition acts as virtual memory to assist the system when RAM runs low.",
        correctAnswer: true,
        explanation: "True. The swap partition provides virtual memory when physical RAM is insufficient."
    },
    {
        id: 21,
        lecture: 2,
        type: "truefalse",
        prompt: "Blocks are data storage units on disks that contain portions of data.",
        correctAnswer: true,
        explanation: "True. Blocks are the basic units of data storage on disks, each containing a portion of file data."
    },
    {
        id: 22,
        lecture: 2,
        type: "truefalse",
        prompt: "NTFS is the filesystem used in modern Windows systems and offers features like security and permissions management.",
        correctAnswer: true,
        explanation: "True. NTFS is the modern Windows filesystem with advanced features including security, permissions, and file compression."
    },
    {
        id: 23,
        lecture: 2,
        type: "truefalse",
        prompt: "The filesystem has no role in data security.",
        correctAnswer: false,
        explanation: "False. Filesystems play a crucial role in data security through permissions, access controls, and file integrity features."
    },
    {
        id: 24,
        lecture: 2,
        type: "truefalse",
        prompt: "A path can be either absolute or relative.",
        correctAnswer: true,
        explanation: "True. Paths can be absolute (starting from root /) or relative (starting from current directory)."
    },
    {
        id: 25,
        lecture: 3,
        type: "truefalse",
        prompt: "User management is important for system security by controlling who has access and what permissions they have.",
        correctAnswer: true,
        explanation: "True. User management is fundamental to system security, controlling access and permissions for different users."
    },
    {
        id: 26,
        lecture: 3,
        type: "truefalse",
        prompt: "When a new user is created, they are typically added to a group with the same name as their username.",
        correctAnswer: true,
        explanation: "True. Most Linux systems create a primary group with the same name as the username for new users."
    },
    {
        id: 27,
        lecture: 3,
        type: "truefalse",
        prompt: "The default shell for new users is always /bin/sh.",
        correctAnswer: false,
        explanation: "False. The default shell is typically /bin/bash or /bin/zsh, not /bin/sh in most modern distributions."
    },
    {
        id: 28,
        lecture: 3,
        type: "truefalse",
        prompt: "User management allows for tracking the activities of each user on the system.",
        correctAnswer: true,
        explanation: "True. User management enables system administrators to track and audit user activities for security and compliance."
    },
    {
        id: 29,
        lecture: 3,
        type: "truefalse",
        prompt: "All users on a Linux system share the same home directory.",
        correctAnswer: false,
        explanation: "False. Each user has their own private home directory, typically located in /home/username."
    }
];

// Remove time limits - no timers needed
const QUESTION_TIME_LIMITS = {};