import { useState, useEffect } from 'react'
import { Users, DollarSign, Receipt, TrendingUp, UserPlus, Plus, Trash2, ArrowRight, MessageSquare, Phone, Camera, User, CreditCard, UsersRound, Percent, Edit3, Save, LogOut, Mail, Menu, X, ChevronRight, Settings, Home, Scale, FileText, Sparkles } from 'lucide-react'
import ReceiptScanner from './ReceiptScanner'
import AuthPage from './AuthPage'
import HomeContent from './HomeContent'
import AssistantChat from './AssistantChat'

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [guestUsageCount, setGuestUsageCount] = useState(0)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [people, setPeople] = useState([])
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState({})
  const [groups, setGroups] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('expenses')
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('home')
  
  // Open Tab states
  const [selectedPartner, setSelectedPartner] = useState('')
  const [quickAmount, setQuickAmount] = useState('')
  const [quickDescription, setQuickDescription] = useState('')
  const [quickPaidBy, setQuickPaidBy] = useState('')
  
  // Form states
  const [newPersonName, setNewPersonName] = useState('')
  const [newPersonPhone, setNewPersonPhone] = useState('')
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitWith: []
  })
  const [newGroup, setNewGroup] = useState({
    name: '',
    members: []
  })
  const [groupExpense, setGroupExpense] = useState({
    description: '',
    subtotal: '',
    tax: '',
    tip: '',
    paidBy: ''
  })
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    avatar: '',
    bio: ''
  })

  // Fetch data
  const fetchPeople = async () => {
    const res = await fetch('/api/people')
    const data = await res.json()
    setPeople(data)
  }

  // Get all people including the logged-in user
  const getAllPeople = () => {
    // Create a user object from authenticated user
    const currentUserAsPerson = {
      id: 'current-user',
      name: authenticatedUser.name,
      phone: userProfile?.phone || authenticatedUser.phone || '',
      isCurrentUser: true
    }
    
    // Check if user is already in people list
    const userExists = people.some(p => p.name === authenticatedUser.name)
    
    if (userExists) {
      return people
    } else {
      // Add current user to the beginning of the list
      return [currentUserAsPerson, ...people]
    }
  }

  const fetchExpenses = async () => {
    const res = await fetch('/api/expenses')
    const data = await res.json()
    setExpenses(data)
  }

  const fetchBalances = async () => {
    const res = await fetch('/api/balances')
    const data = await res.json()
    setBalances(data)
  }

  const fetchGroups = async () => {
    const res = await fetch('/api/groups')
    const data = await res.json()
    setGroups(data)
  }

  const fetchProfile = async () => {
    const res = await fetch('/api/profile')
    const data = await res.json()
    if (data) {
      setUserProfile(data)
      setProfileForm(data)
    }
  }

  useEffect(() => {
    // Check for stored user or guest mode
    // Check localStorage first (remember me), then sessionStorage
    let storedUser = localStorage.getItem('spender_user')
    let fromSession = false
    
    if (!storedUser) {
      storedUser = sessionStorage.getItem('spender_user')
      fromSession = true
    }
    
    const guestMode = localStorage.getItem('spender_guest_mode')
    const guestCount = localStorage.getItem('spender_guest_count')
    
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setAuthenticatedUser(userData)
      
      // If from sessionStorage, set a flag to clear on window close
      if (fromSession) {
        window.addEventListener('beforeunload', () => {
          sessionStorage.removeItem('spender_user')
        })
      }
    } else if (guestMode === 'true') {
      setIsGuestMode(true)
      setGuestUsageCount(parseInt(guestCount || '0'))
    }
  }, [])

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (authenticatedUser) {
      fetchPeople()
      fetchExpenses()
      fetchBalances()
      fetchGroups()
      fetchProfile()
      setQuickPaidBy(authenticatedUser.name)
      
      // Set the logged-in user as the current viewer
      setCurrentUser(authenticatedUser.name)
    }
  }, [authenticatedUser])

  // Handle guest mode
  const handleGuestMode = (guestName) => {
    const guestUser = {
      name: guestName,
      email: `${guestName.toLowerCase().replace(/\s+/g, '')}@guest.temp`,
      isGuest: true
    }
    setAuthenticatedUser(guestUser)
    setIsGuestMode(true)
    setGuestUsageCount(0)
    localStorage.setItem('spender_guest_mode', 'true')
    localStorage.setItem('spender_guest_count', '0')
    localStorage.setItem('spender_user', JSON.stringify(guestUser))
  }

  // Track guest usage
  const trackGuestUsage = () => {
    if (isGuestMode) {
      const newCount = guestUsageCount + 1
      setGuestUsageCount(newCount)
      localStorage.setItem('spender_guest_count', newCount.toString())
      
      // Show prompt after first use
      if (newCount >= 1) {
        setShowGuestPrompt(true)
      }
    }
  }

  // Convert guest to full account
  const convertGuestToAccount = () => {
    localStorage.removeItem('spender_guest_mode')
    localStorage.removeItem('spender_guest_count')
    setIsGuestMode(false)
    setShowGuestPrompt(false)
    // Redirect to signup with pre-filled name
    handleLogout()
  }

  // Handle login
  const handleLogin = (user) => {
    setAuthenticatedUser(user)
    setIsGuestMode(false)
    localStorage.removeItem('spender_guest_mode')
    localStorage.removeItem('spender_guest_count')
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('spender_user')
    localStorage.removeItem('spender_remember')
    sessionStorage.removeItem('spender_user')
    setAuthenticatedUser(null)
    // Clear all data
    setPeople([])
    setExpenses([])
    setBalances({})
    setGroups([])
    setUserProfile(null)
    setCurrentUser(null)
  }

  // Handler functions for HomeContent
  const handleAddPerson = async (e) => {
    e.preventDefault()
    if (!newPersonName.trim()) return
    
    const response = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPersonName, phone: newPersonPhone })
    })
    
    const data = await response.json()
    
    // Show notification if historical expenses were found
    if (data.historicalExpenses > 0) {
      alert(`✅ Friend added!\n\n📊 Found ${data.historicalExpenses} historical expense${data.historicalExpenses > 1 ? 's' : ''} for ${data.name}.\n\nAll past expenses have been linked to this friend!`)
    }
    
    setNewPersonName('')
    setNewPersonPhone('')
    fetchPeople()
    fetchBalances()
    fetchExpenses() // Refresh expenses to show updated names
  }

  const handleDeletePerson = async (id) => {
    await fetch(`/api/people/${id}`, { method: 'DELETE' })
    fetchPeople()
    fetchBalances()
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || newExpense.splitWith.length === 0) {
      alert('Please fill in all fields')
      return
    }
    
    // If more than 2 people are splitting, automatically create a group
    if (newExpense.splitWith.length > 2) {
      const groupMembers = [...new Set([newExpense.paidBy, ...newExpense.splitWith])]
      const amountPerPerson = parseFloat(newExpense.amount) / groupMembers.length
      
      const groupData = {
        name: newExpense.description,
        members: groupMembers,
        totalAmount: parseFloat(newExpense.amount),
        totalPerPerson: amountPerPerson,
        paidBy: newExpense.paidBy
      }
      
      // Create the group
      await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      })
      
      fetchGroups()
      
      alert(`Group "${newExpense.description}" created automatically with ${groupMembers.length} members!`)
    }
    
    // Still create the expense
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    })
    
    // Send SMS notifications to everyone who owes money
    const splitAmount = parseFloat(newExpense.amount) / newExpense.splitWith.length
    const notifications = []
    const notifiedPeople = []
    const skippedPeople = []
    
    console.log('💬 Starting SMS notifications...')
    console.log('Split with:', newExpense.splitWith)
    console.log('Paid by:', newExpense.paidBy)
    
    for (const personName of newExpense.splitWith) {
      // Don't notify the person who paid
      if (personName !== newExpense.paidBy) {
        const person = people.find(p => p.name === personName)
        
        console.log(`Checking ${personName}:`, person)
        
        if (person && person.phone) {
          // Format phone number (remove any non-digit characters except +)
          let formattedPhone = person.phone.replace(/[^\d+]/g, '')
          
          // Ensure phone has country code (add +1 for US if missing)
          if (!formattedPhone.startsWith('+')) {
            if (formattedPhone.length === 10) {
              formattedPhone = '+1' + formattedPhone
            } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
              formattedPhone = '+' + formattedPhone
            } else {
              formattedPhone = '+' + formattedPhone
            }
          }
          
          console.log(`✓ Sending SMS to ${personName} at ${person.phone} (formatted: ${formattedPhone})`)
          notifiedPeople.push(personName)
          
          // Send SMS notification
          notifications.push(
            fetch('/api/notify-expense', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: formattedPhone,
                personName: personName,
                amount: splitAmount.toFixed(2),
                owedTo: newExpense.paidBy,
                expenseName: newExpense.description
              })
            }).then(response => {
              console.log(`SMS response for ${personName}:`, response.status)
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
              }
              return response.json()
            }).then(data => {
              console.log(`SMS data for ${personName}:`, data)
            }).catch(error => {
              console.error(`SMS error for ${personName}:`, error)
              throw error
            })
          )
        } else {
          console.log(`✗ Skipping ${personName} - no phone number`)
          skippedPeople.push(personName)
        }
      } else {
        console.log(`✗ Skipping ${personName} - they paid`)
      }
    }
    
    // Wait for all notifications to be sent
    if (notifications.length > 0) {
      try {
        await Promise.all(notifications)
        console.log(`✅ Sent ${notifications.length} SMS notification(s)`)
        
        // Show user-friendly alert
        let alertMessage = `Expense added! SMS sent to: ${notifiedPeople.join(', ')}`
        if (skippedPeople.length > 0) {
          alertMessage += `\n\nNo SMS sent to: ${skippedPeople.join(', ')} (no phone number)`
        }
        alert(alertMessage)
      } catch (error) {
        console.error('❌ Error sending notifications:', error)
        alert(`Expense added, but SMS failed: ${error.message}`)
      }
    } else {
      console.log('ℹ️ No SMS notifications to send')
      if (skippedPeople.length > 0) {
        alert(`Expense added! No SMS sent (${skippedPeople.join(', ')} have no phone numbers)`)
      }
    }
    
    setNewExpense({ description: '', amount: '', paidBy: '', splitWith: [] })
    fetchExpenses()
    fetchBalances()
    
    // Track guest usage
    trackGuestUsage()
  }

  const handleDeleteExpense = async (id) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    fetchExpenses()
    fetchBalances()
  }

  const handleRequestFunds = async (owedTo, amount, owedBy) => {
    const person = people.find(p => p.name === owedTo)
    if (!person || !person.phone) {
      alert('No phone number for this person')
      return
    }

    await fetch('/api/request-funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: person.phone, amount, owedBy, owedTo })
    })

    alert(`Request sent to ${owedTo}!`)
  }

  const handleCreateGroup = async (groupData) => {
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    })
    
    setShowGroupForm(false)
    setSelectedGroup(null)
    fetchGroups()
  }

  const handleDeleteGroup = async (id) => {
    await fetch(`/api/groups/${id}`, { method: 'DELETE' })
    fetchGroups()
  }

  // Show auth page if not authenticated
  if (!authenticatedUser) {
    return <AuthPage onLogin={handleLogin} onGuestMode={handleGuestMode} />
  }

  // Add person (legacy function, keeping for compatibility)
  const addPerson = async (e) => {
    e.preventDefault()
    if (!newPersonName.trim()) return
    
    await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPersonName, phone: newPersonPhone })
    })
    
    setNewPersonName('')
    setNewPersonPhone('')
    fetchPeople()
    fetchBalances()
  }

  // Save profile
  const saveProfile = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) {
      alert('Please enter your name')
      return
    }
    
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm)
    })
    
    await fetchProfile()
    setShowProfileForm(false)
    setEditingProfile(false)
  }

  // Add expense
  const addExpense = async (e) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || newExpense.splitWith.length === 0) {
      alert('Please fill in all fields')
      return
    }
    
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    })
    
    setNewExpense({
      description: '',
      amount: '',
      paidBy: '',
      splitWith: []
    })
    
    fetchExpenses()
    fetchBalances()
  }

  // Handle receipt scanner results
  const handleReceiptItems = async (itemsByPerson, totalAmount, allItems) => {
    // Calculate totals per person
    const itemizedByPerson = {}
    const splitWith = []
    
    Object.keys(itemsByPerson).forEach(personIdStr => {
      const personId = parseInt(personIdStr)
      const personItems = itemsByPerson[personIdStr]
      const personTotal = personItems.reduce((sum, item) => sum + item.price, 0)
      
      itemizedByPerson[personId] = personTotal
      splitWith.push(personId)
    })
    
    // Ask who paid
    const paidByName = prompt('Who paid for this receipt? Enter their name:')
    const paidByPerson = people.find(p => p.name.toLowerCase() === paidByName?.toLowerCase())
    
    if (!paidByPerson) {
      alert('Person not found. Please try again.')
      return
    }
    
    // Create itemized expense
    const itemsList = allItems.filter(item => item.assignedTo).map(item => ({
      name: item.name,
      price: item.price,
      assignedTo: item.assignedTo
    }))
    
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: `Receipt - ${allItems.length} items`,
        amount: totalAmount,
        paidBy: paidByPerson.id,
        splitWith: splitWith,
        items: itemsList,
        itemizedByPerson: itemizedByPerson
      })
    })
    
    setShowReceiptScanner(false)
    fetchExpenses()
    fetchBalances()
  }

  // Delete expense
  const deleteExpense = async (id) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    fetchExpenses()
    fetchBalances()
  }

  // Settle debt
  const settleDebt = async (from, to, amount) => {
    await fetch('/api/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, amount })
    })
    
    fetchExpenses()
    fetchBalances()
  }

  // Create group
  const createGroup = async (e) => {
    e.preventDefault()
    if (!newGroup.name.trim() || newGroup.members.length < 2) {
      alert('Please enter a group name and select at least 2 members')
      return
    }
    
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup)
    })
    
    setNewGroup({ name: '', members: [] })
    setShowGroupForm(false)
    fetchGroups()
  }

  // Add group expense
  const addGroupExpense = async (e) => {
    e.preventDefault()
    if (!groupExpense.description || !groupExpense.subtotal || !groupExpense.paidBy) {
      alert('Please fill in all required fields')
      return
    }
    
    await fetch(`/api/groups/${selectedGroup}/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupExpense)
    })
    
    setGroupExpense({
      description: '',
      subtotal: '',
      tax: '',
      tip: '',
      paidBy: ''
    })
    setSelectedGroup(null)
    fetchExpenses()
    fetchBalances()
  }

  // Delete group
  const deleteGroup = async (id) => {
    await fetch(`/api/groups/${id}`, { method: 'DELETE' })
    fetchGroups()
  }

  // Toggle group member
  const toggleGroupMember = (personId) => {
    setNewGroup(prev => ({
      ...prev,
      members: prev.members.includes(personId)
        ? prev.members.filter(id => id !== personId)
        : [...prev.members, personId]
    }))
  }

  // Send SMS reminder
  const sendReminder = async (fromPersonId, toPersonId, amount) => {
    const toPerson = people.find(p => p.id === toPersonId)
    
    if (!toPerson.phone) {
      alert(`${toPerson.name} doesn't have a phone number on file. Please add one first.`)
      return
    }
    
    const res = await fetch('/api/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPersonId, toPersonId, amount })
    })
    
    const data = await res.json()
    
    if (data.success) {
      alert(`✅ Reminder sent to ${toPerson.name} at ${data.phone}\n\nMessage: ${data.message}\n\n${data.note}`)
    } else {
      alert('Failed to send reminder: ' + data.error)
    }
  }

  // Toggle person in split
  const toggleSplitWith = (personId) => {
    setNewExpense(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(personId)
        ? prev.splitWith.filter(id => id !== personId)
        : [...prev.splitWith, personId]
    }))
  }

  // Get person name by ID
  const getPersonName = (id) => {
    return people.find(p => p.id === id)?.name || 'Unknown'
  }

  // Calculate summary balances
  const getSummaryBalances = () => {
    const summary = []
    
    Object.keys(balances).forEach(personId => {
      const pid = parseInt(personId)
      let totalOwed = 0
      let totalOwing = 0
      
      Object.keys(balances[personId]).forEach(otherPersonId => {
        const oid = parseInt(otherPersonId)
        const amount = balances[personId][otherPersonId]
        
        if (amount > 0) {
          totalOwing += amount
        }
        
        if (balances[oid] && balances[oid][pid] > 0) {
          totalOwed += balances[oid][pid]
        }
      })
      
      summary.push({
        personId: pid,
        name: getPersonName(pid),
        totalOwed,
        totalOwing,
        netBalance: totalOwed - totalOwing
      })
    })
    
    return summary
  }

  // Get current user's open tab (what they owe)
  const getCurrentUserTab = () => {
    if (!currentUser || !balances[currentUser]) return []
    
    const userDebts = []
    Object.keys(balances[currentUser]).forEach(otherPersonId => {
      const oid = parseInt(otherPersonId)
      const amount = balances[currentUser][oid]
      
      if (amount > 0) {
        userDebts.push({
          toId: oid,
          toName: getPersonName(oid),
          amount: amount
        })
      }
    })
    
    return userDebts
  }

  const getTotalOwed = () => {
    return getCurrentUserTab().reduce((sum, debt) => sum + debt.amount, 0)
  }

  // Render page content based on active page
  const renderPageContent = () => {
    if (activePage === 'account') {
      return (
        <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Account Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {userProfile?.avatar || authenticatedUser.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{authenticatedUser.name}</h3>
            <p className="text-sm text-gray-500">{authenticatedUser.email}</p>
          </div>

          {/* Account Information */}
          <div className="space-y-4 mb-6">
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Account Information</h4>
              
              {/* Email */}
              <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-600">Email</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{authenticatedUser.email}</p>
              </div>

              {/* Phone */}
              <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-600">Phone</span>
                </div>
                {authenticatedUser.phone ? (
                  <p className="text-sm font-medium text-gray-900">{authenticatedUser.phone}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-red-600 font-medium">Not provided</p>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold">!</span>
                  </div>
                )}
              </div>

              {/* Profile Bio */}
              {userProfile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-600">Bio</span>
                  </div>
                  {userProfile.bio ? (
                    <p className="text-sm text-gray-900">{userProfile.bio}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-orange-600 font-medium">Not set</p>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-bold">!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Missing Information Alert */}
          {(!authenticatedUser.phone || (userProfile && !userProfile.bio)) && (
            <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-orange-500 rounded-full">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-orange-900 mb-1">Incomplete Profile</h5>
                  <p className="text-xs text-orange-700">
                    {!authenticatedUser.phone && "Add your phone number for SMS features. "}
                    {userProfile && !userProfile.bio && "Add a bio to personalize your profile."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Button */}
          <button
            onClick={() => {
              if (!userProfile) {
                setShowProfileForm(true)
              } else {
                setEditingProfile(true)
                setShowProfileForm(true)
              }
            }}
            className="w-full px-4 py-3 gradient-primary text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            {userProfile ? 'Edit Profile' : 'Complete Profile'}
          </button>

          {/* Account Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-indigo-600">{people.length}</div>
                <div className="text-xs text-gray-600 font-medium">Friends</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-purple-600">{expenses.length}</div>
                <div className="text-xs text-gray-600 font-medium">Expenses</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-600">{groups.length}</div>
                <div className="text-xs text-gray-600 font-medium">Groups</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${currentUser ? getTotalOwed().toFixed(0) : '0'}
                </div>
                <div className="text-xs text-gray-600 font-medium">You Owe</div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (activePage === 'balances') {
      // Calculate all balances between people
      const balanceMatrix = {}
      
      // Initialize balance matrix
      people.forEach(person1 => {
        balanceMatrix[person1.name] = {}
        people.forEach(person2 => {
          if (person1.name !== person2.name) {
            balanceMatrix[person1.name][person2.name] = 0
          }
        })
      })

      // Calculate from expenses
      expenses.forEach(expense => {
        const splitAmount = expense.amount / expense.splitWith.length
        expense.splitWith.forEach(person => {
          if (person !== expense.paidBy) {
            balanceMatrix[person][expense.paidBy] += splitAmount
          }
        })
      })

      // Calculate from groups
      groups.forEach(group => {
        // Find who paid (assuming first member or need to track this)
        group.members.forEach((member, idx) => {
          if (idx > 0) { // Everyone except first member owes them
            balanceMatrix[member][group.members[0]] += group.totalPerPerson
          }
        })
      })

      // Calculate individual outstanding balances
      const individualBalances = {}
      people.forEach(person => {
        let totalOwed = 0 // What they owe to others
        let totalOwedToThem = 0 // What others owe to them
        
        people.forEach(otherPerson => {
          if (person.name !== otherPerson.name) {
            totalOwed += balanceMatrix[person.name][otherPerson.name] || 0
            totalOwedToThem += balanceMatrix[otherPerson.name][person.name] || 0
          }
        })
        
        individualBalances[person.name] = {
          owes: totalOwed,
          owedToThem: totalOwedToThem,
          netBalance: totalOwedToThem - totalOwed
        }
      })

      // Simplify balances (net amounts)
      const simplifiedBalances = []
      people.forEach(person1 => {
        people.forEach(person2 => {
          if (person1.name < person2.name) { // Avoid duplicates
            const amount1to2 = balanceMatrix[person1.name][person2.name] || 0
            const amount2to1 = balanceMatrix[person2.name][person1.name] || 0
            const netAmount = amount1to2 - amount2to1
            
            if (Math.abs(netAmount) > 0.01) {
              simplifiedBalances.push({
                from: netAmount > 0 ? person1.name : person2.name,
                to: netAmount > 0 ? person2.name : person1.name,
                amount: Math.abs(netAmount)
              })
            }
          }
        })
      })

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Balances Section - 2 columns */}
          <div className="lg:col-span-2 glass-card rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Scale className="w-8 h-8 text-indigo-600" />
                Open Balances
              </h2>
              <p className="text-gray-600">See who owes whom across all expenses and groups</p>
            </div>

          {/* Individual Outstanding Balances */}
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Individual Outstanding Balances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map(person => {
                const balance = individualBalances[person.name]
                const netBalance = balance.netBalance
                
                return (
                  <div key={person.id} className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                        netBalance > 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                        netBalance < 0 ? 'bg-gradient-to-br from-red-400 to-pink-500' :
                        'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{person.name}</div>
                        {person.phone && <div className="text-xs text-gray-500">{person.phone}</div>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Owes Others:</span>
                        <span className="font-bold text-red-600">${balance.owes.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Owed to Them:</span>
                        <span className="font-bold text-green-600">${balance.owedToThem.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t-2 border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Net Balance:</span>
                          <span className={`text-lg font-bold ${
                            netBalance > 0 ? 'text-green-600' :
                            netBalance < 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {netBalance > 0 ? '+' : ''}{netBalance < 0 ? '-' : ''}${Math.abs(netBalance).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-center mt-1 text-gray-500">
                          {netBalance > 0 ? 'Gets back' : netBalance < 0 ? 'Needs to pay' : 'All even'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pairwise Balances */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Pairwise Balances</h3>
          {simplifiedBalances.length > 0 ? (
            <div className="space-y-4">
              {simplifiedBalances.map((balance, idx) => {
                const fromPerson = people.find(p => p.name === balance.from)
                const toPerson = people.find(p => p.name === balance.to)
                
                return (
                  <div key={idx} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* From Person */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {balance.from.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{balance.from}</div>
                            <div className="text-xs text-gray-500">Owes</div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-1 flex items-center justify-center">
                          <ArrowRight className="w-8 h-8 text-indigo-600" />
                        </div>

                        {/* To Person */}
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-bold text-gray-900 text-right">{balance.to}</div>
                            <div className="text-xs text-gray-500 text-right">Receives</div>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {balance.to.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="ml-6 text-right">
                        <div className="text-3xl font-bold text-indigo-600">
                          ${balance.amount.toFixed(2)}
                        </div>
                        {toPerson?.phone && (
                          <button
                            onClick={() => handleRequestFunds(balance.to, balance.amount, balance.from)}
                            className="mt-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all duration-200 text-sm font-semibold flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Summary */}
              <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
                    <div className="text-2xl font-bold text-indigo-600">
                      ${simplifiedBalances.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Open Balances</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {simplifiedBalances.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Settled Up!</h3>
              <p className="text-gray-600">No outstanding balances between friends.</p>
            </div>
          )}

          {/* Open Tab Section - Integrated */}
          <div className="mt-12 pt-8 border-t-4 border-indigo-200">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-600" />
                Open Tab Assistant
              </h2>
              <p className="text-gray-600">Track ongoing back-and-forth spending with a friend</p>
            </div>

            {/* Partner Selection */}
            <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
              <label className="block text-sm font-bold text-gray-700 mb-3">Select Your Tab Partner:</label>
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
              >
                <option value="">Choose a friend...</option>
                {people.map(person => (
                  <option key={person.id} value={person.name}>{person.name}</option>
                ))}
              </select>
            </div>

            {selectedPartner ? (
              <>
                {(() => {
                  // Calculate running tab inline
                  const calculateRunningTab = () => {
                    const transactions = []
                    let youPaidTotal = 0
                    let theyPaidTotal = 0

                    expenses.forEach(expense => {
                      const bothInvolved = 
                        (expense.paidBy === authenticatedUser.name && expense.splitWith.includes(selectedPartner)) ||
                        (expense.paidBy === selectedPartner && expense.splitWith.includes(authenticatedUser.name))

                      if (bothInvolved) {
                        const splitAmount = expense.amount / expense.splitWith.length
                        
                        if (expense.paidBy === authenticatedUser.name) {
                          youPaidTotal += splitAmount
                          transactions.push({
                            ...expense,
                            type: 'credit',
                            amount: splitAmount,
                            description: expense.description,
                            date: expense.date || new Date().toISOString(),
                            paidByYou: true
                          })
                        } else if (expense.paidBy === selectedPartner) {
                          theyPaidTotal += splitAmount
                          transactions.push({
                            ...expense,
                            type: 'debit',
                            amount: splitAmount,
                            description: expense.description,
                            date: expense.date || new Date().toISOString(),
                            paidByYou: false
                          })
                        }
                      }
                    })

                    transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
                    const netBalance = youPaidTotal - theyPaidTotal
                    const equalSpending = Math.min(youPaidTotal, theyPaidTotal)

                    return {
                      transactions,
                      netBalance,
                      youOwe: netBalance < 0 ? Math.abs(netBalance) : 0,
                      theyOwe: netBalance > 0 ? netBalance : 0,
                      youPaid: youPaidTotal,
                      theyPaid: theyPaidTotal,
                      equalSpending: equalSpending
                    }
                  }

                  const tabData = calculateRunningTab()

                  return (
                    <>
                      {/* Running Balance Card */}
                      <div className="mb-6 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow-lg">
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-bold text-gray-700 mb-2">Current Balance</h3>
                          <div className="flex items-center justify-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                              {authenticatedUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center">
                              {tabData.netBalance === 0 ? (
                                <div className="text-2xl font-bold text-green-600">All Even! 🎉</div>
                              ) : tabData.netBalance > 0 ? (
                                <>
                                  <div className="text-sm text-gray-600">{selectedPartner} owes you</div>
                                  <div className="text-4xl font-bold text-green-600">${tabData.theyOwe.toFixed(2)}</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm text-gray-600">You owe {selectedPartner}</div>
                                  <div className="text-4xl font-bold text-red-600">${tabData.youOwe.toFixed(2)}</div>
                                </>
                              )}
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                              {selectedPartner.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {/* Equal Spending Tracker */}
                        <div className="mt-6 pt-6 border-t-2 border-amber-300">
                          <h4 className="text-sm font-bold text-gray-700 mb-3 text-center">Equal Spending Tracker</h4>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-gray-600 mb-1">You Paid</div>
                              <div className="text-lg font-bold text-indigo-600">${tabData.youPaid.toFixed(2)}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg text-center border-2 border-green-400">
                              <div className="text-xs text-green-700 font-semibold mb-1">Equal</div>
                              <div className="text-lg font-bold text-green-600">${tabData.equalSpending.toFixed(2)}</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-gray-600 mb-1">They Paid</div>
                              <div className="text-lg font-bold text-purple-600">${tabData.theyPaid.toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="text-center text-xs text-gray-600">
                            {tabData.equalSpending > 0 ? (
                              <>You've both contributed equally on <span className="font-bold text-green-600">${tabData.equalSpending.toFixed(2)}</span> worth of expenses!</>
                            ) : (
                              <>No equal spending yet. Start splitting expenses!</>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3 justify-center mt-6">
                          {tabData.netBalance !== 0 && (
                            <button
                              onClick={() => {
                                const person = people.find(p => p.name === selectedPartner)
                                if (person?.phone) {
                                  if (tabData.netBalance > 0) {
                                    handleRequestFunds(selectedPartner, tabData.theyOwe, authenticatedUser.name)
                                  } else {
                                    alert(`You owe ${selectedPartner} $${tabData.youOwe.toFixed(2)}`)
                                  }
                                } else {
                                  alert('No phone number for this person')
                                }
                              }}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-semibold flex items-center gap-2"
                            >
                              <MessageSquare className="w-5 h-5" />
                              {tabData.netBalance > 0 ? 'Request Payment' : 'Remind Me'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Mark tab as settled with ${selectedPartner}?`)) {
                                alert('Feature coming soon: Mark as settled')
                              }
                            }}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold"
                          >
                            Settle Up
                          </button>
                        </div>
                      </div>

                      {/* Transaction History */}
                      {tabData.transactions.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
                          <div className="space-y-3">
                            {tabData.transactions.map((transaction, idx) => (
                              <div
                                key={idx}
                                className={`p-4 rounded-xl border-2 ${
                                  transaction.type === 'credit'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900">{transaction.description}</div>
                                    <div className="text-sm text-gray-600">
                                      {transaction.type === 'credit' 
                                        ? `${selectedPartner} owes you` 
                                        : `You owe ${selectedPartner}`}
                                    </div>
                                  </div>
                                  <div className={`text-2xl font-bold ${
                                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Tab Partner</h3>
                <p className="text-gray-600">Choose a friend to start tracking your ongoing expenses</p>
              </div>
            )}
          </div>
          </div>
          
          {/* AI Assistant Section - 1 column */}
          <div className="lg:col-span-1">
            <AssistantChat 
              authenticatedUser={authenticatedUser}
              onExpenseAdded={() => {
                fetchExpenses()
                fetchBalances()
              }}
            />
          </div>
        </div>
      )
    }

    if (activePage === 'opentab') {
      // Calculate running tab between you and selected partner with equal spending tracking
      const calculateRunningTab = () => {
        if (!selectedPartner) return { 
          transactions: [], 
          netBalance: 0, 
          youOwe: 0, 
          theyOwe: 0,
          youPaid: 0,
          theyPaid: 0,
          equalSpending: 0
        }

        const transactions = []
        let youPaidTotal = 0
        let theyPaidTotal = 0

        // Get all expenses involving both people
        expenses.forEach(expense => {
          const bothInvolved = 
            (expense.paidBy === authenticatedUser.name && expense.splitWith.includes(selectedPartner)) ||
            (expense.paidBy === selectedPartner && expense.splitWith.includes(authenticatedUser.name))

          if (bothInvolved) {
            const splitAmount = expense.amount / expense.splitWith.length
            
            if (expense.paidBy === authenticatedUser.name) {
              // You paid
              youPaidTotal += splitAmount
              transactions.push({
                ...expense,
                type: 'credit',
                amount: splitAmount,
                description: expense.description,
                date: expense.date || new Date().toISOString(),
                paidByYou: true
              })
            } else if (expense.paidBy === selectedPartner) {
              // They paid
              theyPaidTotal += splitAmount
              transactions.push({
                ...expense,
                type: 'debit',
                amount: splitAmount,
                description: expense.description,
                date: expense.date || new Date().toISOString(),
                paidByYou: false
              })
            }
          }
        })

        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

        // Calculate net balance and equal spending
        const netBalance = youPaidTotal - theyPaidTotal
        const equalSpending = Math.min(youPaidTotal, theyPaidTotal)

        return {
          transactions,
          netBalance,
          youOwe: netBalance < 0 ? Math.abs(netBalance) : 0,
          theyOwe: netBalance > 0 ? netBalance : 0,
          youPaid: youPaidTotal,
          theyPaid: theyPaidTotal,
          equalSpending: equalSpending
        }
      }

      const tabData = calculateRunningTab()

      const handleQuickAdd = async () => {
        if (!quickAmount || !quickDescription || !selectedPartner) {
          alert('Please fill in all fields and select a partner')
          return
        }

        const newExpenseData = {
          description: quickDescription,
          amount: parseFloat(quickAmount),
          paidBy: quickPaidBy,
          splitWith: [authenticatedUser.name, selectedPartner]
        }

        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExpenseData)
        })

        setQuickAmount('')
        setQuickDescription('')
        fetchExpenses()
        fetchBalances()
      }

      return (
        <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              Open Tab Assistant
            </h2>
            <p className="text-gray-600">Track ongoing back-and-forth spending with a friend</p>
          </div>

          {/* Partner Selection */}
          <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
            <label className="block text-sm font-bold text-gray-700 mb-3">Select Your Tab Partner:</label>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
            >
              <option value="">Choose a friend...</option>
              {people.map(person => (
                <option key={person.id} value={person.name}>{person.name}</option>
              ))}
            </select>
          </div>

          {selectedPartner ? (
            <>
              {/* Running Balance Card */}
              <div className="mb-6 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Current Balance</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {authenticatedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center">
                      {tabData.netBalance === 0 ? (
                        <div className="text-2xl font-bold text-green-600">All Even! 🎉</div>
                      ) : tabData.netBalance > 0 ? (
                        <>
                          <div className="text-sm text-gray-600">{selectedPartner} owes you</div>
                          <div className="text-4xl font-bold text-green-600">${tabData.theyOwe.toFixed(2)}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-gray-600">You owe {selectedPartner}</div>
                          <div className="text-4xl font-bold text-red-600">${tabData.youOwe.toFixed(2)}</div>
                        </>
                      )}
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedPartner.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Equal Spending Tracker */}
                <div className="mt-6 pt-6 border-t-2 border-amber-300">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 text-center">Equal Spending Tracker</h4>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-3 bg-white rounded-lg text-center">
                      <div className="text-xs text-gray-600 mb-1">You Paid</div>
                      <div className="text-lg font-bold text-indigo-600">${tabData.youPaid.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg text-center border-2 border-green-400">
                      <div className="text-xs text-green-700 font-semibold mb-1">Equal</div>
                      <div className="text-lg font-bold text-green-600">${tabData.equalSpending.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg text-center">
                      <div className="text-xs text-gray-600 mb-1">They Paid</div>
                      <div className="text-lg font-bold text-purple-600">${tabData.theyPaid.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-600">
                    {tabData.equalSpending > 0 ? (
                      <>You've both contributed equally on <span className="font-bold text-green-600">${tabData.equalSpending.toFixed(2)}</span> worth of expenses!</>
                    ) : (
                      <>No equal spending yet. Start splitting expenses!</>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 justify-center mt-6">
                  {tabData.netBalance !== 0 && (
                    <button
                      onClick={() => {
                        const person = people.find(p => p.name === selectedPartner)
                        if (person?.phone) {
                          if (tabData.netBalance > 0) {
                            handleRequestFunds(selectedPartner, tabData.theyOwe, authenticatedUser.name)
                          } else {
                            alert(`You owe ${selectedPartner} $${tabData.youOwe.toFixed(2)}`)
                          }
                        } else {
                          alert('No phone number for this person')
                        }
                      }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-semibold flex items-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      {tabData.netBalance > 0 ? 'Request Payment' : 'Remind Me'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Mark tab as settled with ${selectedPartner}?`)) {
                        // This would ideally mark expenses as settled
                        alert('Feature coming soon: Mark as settled')
                      }
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold"
                  >
                    Settle Up
                  </button>
                </div>
              </div>

              {/* Quick Add Transaction */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Add Transaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="What was it for?"
                    value={quickDescription}
                    onChange={(e) => setQuickDescription(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={quickPaidBy}
                    onChange={(e) => setQuickPaidBy(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
                  >
                    <option value={authenticatedUser.name}>I paid</option>
                    <option value={selectedPartner}>{selectedPartner} paid</option>
                  </select>
                  <button
                    onClick={handleQuickAdd}
                    className="px-6 py-3 gradient-primary text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
                {tabData.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {tabData.transactions.map((transaction, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border-2 ${
                          transaction.type === 'credit'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-600">
                              {transaction.type === 'credit' 
                                ? `${selectedPartner} owes you` 
                                : `You owe ${selectedPartner}`}
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No transactions yet. Add your first one above!
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Tab Partner</h3>
              <p className="text-gray-600">Choose a friend to start tracking your ongoing expenses</p>
            </div>
          )}
        </div>
      )
    }

    if (activePage === 'settings') {
      return (
        <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Settings</h2>
          <p className="text-gray-600">Settings page coming soon...</p>
        </div>
      )
    }

    // Default: Home page
    return (
      <HomeContent
        people={people}
        allPeople={getAllPeople()}
        expenses={expenses}
        groups={groups}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newPersonName={newPersonName}
        setNewPersonName={setNewPersonName}
        newPersonPhone={newPersonPhone}
        setNewPersonPhone={setNewPersonPhone}
        handleAddPerson={handleAddPerson}
        handleDeletePerson={handleDeletePerson}
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        onOpenAssistant={() => setActivePage('balances')}
        handleAddExpense={handleAddExpense}
        handleDeleteExpense={handleDeleteExpense}
        handleRequestFunds={handleRequestFunds}
        setShowReceiptScanner={setShowReceiptScanner}
        authenticatedUser={authenticatedUser}
        showGroupForm={showGroupForm}
        setShowGroupForm={setShowGroupForm}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        handleCreateGroup={handleCreateGroup}
        handleDeleteGroup={handleDeleteGroup}
        getCurrentUserTab={getCurrentUserTab}
        setCurrentUser={setCurrentUser}
        userProfile={userProfile}
        setShowProfileForm={setShowProfileForm}
        setEditingProfile={setEditingProfile}
      />
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 relative z-10">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-8 left-8 z-50 p-3 glass-card-dark text-white rounded-xl hover:bg-indigo-500/20 transition-all duration-200 shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Collapsible Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="mb-8 pt-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {userProfile?.avatar || authenticatedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{authenticatedUser.name}</h3>
                <p className="text-xs text-gray-500">{authenticatedUser.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {/* Home */}
            <button
              onClick={() => {
                setActivePage('home')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                activePage === 'home'
                  ? 'gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Account */}
            <button
              onClick={() => {
                setActivePage('account')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                activePage === 'account'
                  ? 'gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <span className="font-semibold">Account</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Balances & Open Tab (Combined) */}
            <button
              onClick={() => {
                setActivePage('balances')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                activePage === 'balances'
                  ? 'gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5" />
                <span className="font-semibold">Balances & Open Tab</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                setActivePage('settings')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                activePage === 'settings'
                  ? 'gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="font-semibold">Settings</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>

          {/* Logout Button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
        ></div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {renderPageContent()}
      </div>

      {/* Receipt Scanner Modal */}
      {showReceiptScanner && (
        <ReceiptScanner
          people={people}
          onItemsExtracted={handleReceiptItems}
          onClose={() => setShowReceiptScanner(false)}
        />
      )}

      {/* Guest Account Prompt */}
      {showGuestPrompt && isGuestMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-float">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Enjoying Spender?
              </h2>
              <p className="text-gray-600">
                You've used your first expense! Create a full account to:
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                <span className="text-gray-700 font-medium">Save your expenses permanently</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                <span className="text-gray-700 font-medium">Access from any device</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                <span className="text-gray-700 font-medium">Invite friends to split expenses</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                <span className="text-gray-700 font-medium">Get SMS payment reminders</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={convertGuestToAccount}
                className="w-full px-6 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 font-bold text-lg"
              >
                Create Free Account
              </button>
              <button
                onClick={() => setShowGuestPrompt(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                Continue as Guest
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Guest data is temporary and will be lost when you close the app
            </p>
          </div>
        </div>
      )}

      {/* Guest Mode Banner */}
      {isGuestMode && !showGuestPrompt && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <User className="w-5 h-5" />
            <div>
              <div className="font-bold">Guest Mode</div>
              <div className="text-xs opacity-90">Data won't be saved</div>
            </div>
            <button
              onClick={() => setShowGuestPrompt(true)}
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
