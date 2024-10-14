
<?php include ('head.php');?>

<body>

    <div id="wrapper">

        <!-- Navigation -->
              <?php include ('view_banner.php');?>
        <!-- Page Content -->
        <div id="page-wrapper">

    <heading class="voters_heading">
        <center><h1>Registered Presidential Candidates</h1>
             <center>
                <select onchange = "page(this.value)">
                <option disabled selected>Select Candidate Group</option>
                <option disabled selected>President</option>
                <option value = "vp.php">Vice President</option>
                <option value = "sec.php">Secretary</option>
				<option value = "tre.php">Treasurer</option>
				<option value = "pro.php">P.R.O.</option>
                <option value = "fyr.php">First Year Representative</option>
                <option value = "syr.php">Second Year Representative</option>
                <option value = "tyr.php">Third Year Representative</option>
                <option value = "fryr.php">Fourth Year Representative</option>
                </select>
            </center>

    <script>
        function page (src){
            window.location=src;
    }
    </script>
<p/>

    </heading>
            <div class="row">
				
                    <div class="panel panel-default">
                       
                        <div class="panel-body">
                                <table class="table table-striped table-bordered table-hover" id="dataTables-example" border="0">

                                    <thead class="thead">                                    	
                                   
                                         <tr>
                                            <th>Image</th>
                                            <th>Firstname</th>
                                            <th>Lastname</th>
                                            <th>Party</th>
                                            <th>Year Level</th>
                                            <th>Gender</th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
									
                                        <tr>
										<?php 
											require '../admin/dbcon.php';
											$bool = false;
											$query = $conn->query("SELECT * FROM candidate WHERE `position` = 'President'");
												while($row = $query->fetch_array()){
													$candidate_id=$row['candidate_id'];
										?>
											
											<td width="50"><img src="../admin/<?php echo $row['img']; ?>" width="50" height="50" class="img-rounded"></td>
                                            <td><?php echo $row ['firstname'];?></td>
                                            <td><?php echo $row ['lastname'];?></td>
                                            <td><?php echo $row ['party'];?></td>
                                            <td><?php echo $row ['year_level'];?></td>
                                            <td><?php echo $row ['gender'];?></td>
                                        </tr>
										
                                       <?php } ?>
                                    </tbody>
                                </table>
                            
                            
                        </div>
                        <!-- /.panel-body -->
                    </div>
                    <!-- /.panel -->



              
            </div>
            <!-- /.row -->
        </div>
        <!-- /#page-wrapper -->

    </div>
    <!-- /#wrapper -->
    <?php    
        include ('footer.php');
        ?>

    <?php include ('script.php');?>



</body>

</html>

